import { Navigate } from 'react-router-dom';

// Redirect old PriceCalculator route to new integrated calculator
export default function CalcPrints() {
  return <Navigate to="/calculator" replace />;
}
