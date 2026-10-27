import type { Metadata } from "next";
import ForecastLab from "@/components/ForecastLab";

export const metadata: Metadata = {
  title: "Supply Chain Forecast Lab | Decision Lab",
  description:
    "Compare demand forecasting baselines in your browser — seasonal naive, moving average, and linear trend with MAE/WAPE holdout and a 7-day forecast.",
};

export default function ForecastPage() {
  return <ForecastLab />;
}
