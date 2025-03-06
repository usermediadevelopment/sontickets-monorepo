type Value = {
  text: string;
  number: number;
  className?: string;
};
interface RatingCircleProps {
  value: Value;
  maxValue: Value;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function RatingComponent({
  value,
  maxValue,
  size = 120,
  strokeWidth = 8,
  className = "",
}: RatingCircleProps) {
  const percentage = (value.number / maxValue.number) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-row items-center justify-center">
        <span className={`font-bold text-gray-800 ${value.className}`}>
          {value.text}
        </span>

        <span className={`font-bold text-gray-400 ${maxValue.className}`}>
          /{maxValue.text}
        </span>
      </div>
    </div>
  );
}
