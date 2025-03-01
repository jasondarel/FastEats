const ErrorState = ({ error }) => {
  return (
    <div className="text-red-500 text-center p-5 text-lg font-semibold">
      {error}
    </div>
  );
};

export default ErrorState;
