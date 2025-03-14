import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { CalendarIcon, Clock, Info } from "lucide-react";

interface InvestmentHorizonStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onUpdateHorizon?: (horizon: { years: number; type: string }) => void;
  initialHorizon?: { years: number; type: string };
}

const InvestmentHorizonStep: React.FC<InvestmentHorizonStepProps> = ({
  onNext = () => {},
  onPrevious = () => {},
  onUpdateHorizon = () => {},
  initialHorizon = { years: 5, type: "medium-term" },
}) => {
  const [years, setYears] = useState<number>(initialHorizon.years);
  const [horizonType, setHorizonType] = useState<string>(initialHorizon.type);

  const handleYearsChange = (value: number[]) => {
    const newYears = value[0];
    setYears(newYears);
    onUpdateHorizon({ years: newYears, type: horizonType });
  };

  const handleTypeChange = (value: string) => {
    setHorizonType(value);
    onUpdateHorizon({ years: years, type: value });
  };

  const getHorizonDescription = () => {
    switch (horizonType) {
      case "short-term":
        return "Short-term investments typically focus on capital preservation and liquidity.";
      case "medium-term":
        return "Medium-term investments balance growth and stability over several years.";
      case "long-term":
        return "Long-term investments prioritize growth and can withstand market volatility.";
      default:
        return "Select an investment horizon that aligns with your financial goals.";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl text-blue-800">
            Investment Horizon
          </CardTitle>
        </div>
        <CardDescription className="text-gray-600 mt-2">
          Define how long you plan to keep your investments before needing to
          access the funds.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Investment Timeframe</h3>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
              {years} {years === 1 ? "Year" : "Years"}
            </div>
          </div>

          <div className="px-2">
            <Slider
              defaultValue={[years]}
              max={30}
              min={1}
              step={1}
              onValueChange={handleYearsChange}
              className="my-6"
            />

            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Investment Horizon Type</h3>

          <RadioGroup
            defaultValue={horizonType}
            onValueChange={handleTypeChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${horizonType === "short-term" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  value="short-term"
                  id="short-term"
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="short-term"
                    className="font-medium cursor-pointer"
                  >
                    Short-term
                  </label>
                  <p className="text-sm text-gray-500">1-3 years</p>
                </div>
              </div>
            </div>

            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${horizonType === "medium-term" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  value="medium-term"
                  id="medium-term"
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="medium-term"
                    className="font-medium cursor-pointer"
                  >
                    Medium-term
                  </label>
                  <p className="text-sm text-gray-500">4-10 years</p>
                </div>
              </div>
            </div>

            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${horizonType === "long-term" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  value="long-term"
                  id="long-term"
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="long-term"
                    className="font-medium cursor-pointer"
                  >
                    Long-term
                  </label>
                  <p className="text-sm text-gray-500">10+ years</p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Horizon Impact</h4>
            <p className="text-sm text-amber-700 mt-1">
              {getHorizonDescription()}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </CardFooter>
    </Card>
  );
};

export default InvestmentHorizonStep;
