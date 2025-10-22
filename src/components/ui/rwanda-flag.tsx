interface RwandaFlagProps {
  className?: string;
}

export const RwandaFlag = ({ className = "w-6 h-4" }: RwandaFlagProps) => {
  return (
    <div className={`${className} rounded-sm overflow-hidden border border-gray-200`}>
      <svg viewBox="0 0 6 4" className="w-full h-full">
        {/* Blue stripe */}
        <rect x="0" y="0" width="6" height="1.33" fill="#00A651" />
        {/* Yellow stripe */}
        <rect x="0" y="1.33" width="6" height="1.33" fill="#FAD201" />
        {/* Green stripe */}
        <rect x="0" y="2.66" width="6" height="1.34" fill="#1EB53A" />
        {/* Sun symbol */}
        <circle cx="5" cy="0.66" r="0.3" fill="#FAD201" />
      </svg>
    </div>
  );
};