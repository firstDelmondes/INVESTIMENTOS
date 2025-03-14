import React, { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

interface AssetClass {
  id: string;
  name: string;
  description: string;
  category: "Stocks" | "Bonds" | "Alternatives" | "Cash";
}

interface AssetClassesStepProps {
  onPrevious?: () => void;
  onNext?: (selectedAssets: string[]) => void;
  preselectedAssets?: string[];
}

const AssetClassesStep: React.FC<AssetClassesStepProps> = ({
  onPrevious = () => {},
  onNext = () => {},
  preselectedAssets = [],
}) => {
  const [selectedAssets, setSelectedAssets] =
    useState<string[]>(preselectedAssets);

  // Sample asset classes data
  const assetClasses: AssetClass[] = [
    // Stocks
    {
      id: "us-large-cap",
      name: "US Large Cap",
      description: "Large US companies with market cap > $10B",
      category: "Stocks",
    },
    {
      id: "us-mid-cap",
      name: "US Mid Cap",
      description: "Medium US companies with market cap $2-10B",
      category: "Stocks",
    },
    {
      id: "us-small-cap",
      name: "US Small Cap",
      description: "Small US companies with market cap < $2B",
      category: "Stocks",
    },
    {
      id: "international-developed",
      name: "International Developed",
      description: "Stocks from developed markets outside the US",
      category: "Stocks",
    },
    {
      id: "emerging-markets",
      name: "Emerging Markets",
      description: "Stocks from developing economies",
      category: "Stocks",
    },

    // Bonds
    {
      id: "us-treasury",
      name: "US Treasury",
      description: "US government bonds",
      category: "Bonds",
    },
    {
      id: "corporate-bonds",
      name: "Corporate Bonds",
      description: "Debt securities issued by corporations",
      category: "Bonds",
    },
    {
      id: "municipal-bonds",
      name: "Municipal Bonds",
      description: "Bonds issued by states, cities, and counties",
      category: "Bonds",
    },
    {
      id: "international-bonds",
      name: "International Bonds",
      description: "Bonds issued by foreign governments and corporations",
      category: "Bonds",
    },
    {
      id: "tips",
      name: "TIPS",
      description: "Treasury Inflation-Protected Securities",
      category: "Bonds",
    },

    // Alternatives
    {
      id: "real-estate",
      name: "Real Estate",
      description: "REITs and real estate investments",
      category: "Alternatives",
    },
    {
      id: "commodities",
      name: "Commodities",
      description: "Raw materials like gold, oil, and agricultural products",
      category: "Alternatives",
    },
    {
      id: "private-equity",
      name: "Private Equity",
      description: "Investments in private companies",
      category: "Alternatives",
    },
    {
      id: "hedge-funds",
      name: "Hedge Funds",
      description: "Alternative investment using pooled funds",
      category: "Alternatives",
    },

    // Cash
    {
      id: "money-market",
      name: "Money Market",
      description: "Short-term, high-quality investments",
      category: "Cash",
    },
    {
      id: "certificates-of-deposit",
      name: "Certificates of Deposit",
      description: "Time deposits with fixed term and interest rate",
      category: "Cash",
    },
  ];

  const categories = ["Stocks", "Bonds", "Alternatives", "Cash"];

  const toggleAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId],
    );
  };

  const handleNext = () => {
    onNext(selectedAssets);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Select Asset Classes
        </h1>
        <p className="text-gray-600 mt-2">
          Choose the asset classes you want to include in your investment
          portfolio.
        </p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category} className="bg-card">
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                Select the {category.toLowerCase()} you want to include in your
                portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetClasses
                  .filter((asset) => asset.category === category)
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={asset.id}
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={() => toggleAsset(asset.id)}
                        className="mt-1"
                      />
                      <div>
                        <label
                          htmlFor={asset.id}
                          className="font-medium text-gray-900 cursor-pointer flex items-center"
                        >
                          {asset.name}
                          <Info className="h-4 w-4 ml-2 text-gray-400" />
                        </label>
                        <p className="text-sm text-gray-500">
                          {asset.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedAssets.length === 0}
          className="flex items-center"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {selectedAssets.length === 0 && (
        <p className="text-red-500 text-sm mt-2 text-center">
          Please select at least one asset class to continue
        </p>
      )}
    </div>
  );
};

export default AssetClassesStep;
