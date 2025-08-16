import { ArrowLeft } from "lucide-react";

const BackButton = ({ onClick }) => {
  return (
    <div
      className="absolute top-4 left-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-2 bg-white/50 rounded-full hover:bg-white/70 transition-all duration-300 ease-in-out">
        <ArrowLeft
          className="text-yellow-600 group-hover:translate-x-[-4px] transition-transform"
          size={24}
        />
      </div>
    </div>
  );
};

export default BackButton;
