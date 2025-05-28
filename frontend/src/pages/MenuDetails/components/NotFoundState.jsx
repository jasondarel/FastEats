/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
const NotFoundState = ({ message = "Not found." }) => {
  return (
    <div className="text-gray-500 text-center p-5 text-lg font-semibold">
      {message}
    </div>
  );
};

export default NotFoundState;
