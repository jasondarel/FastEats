/* eslint-disable react/prop-types */
import Sidebar from "../../../components/Sidebar";
import ChatHeader from "./ChatHeader";
import ErrorState from "./ErrorState";

const ErrorPage = ({ error, onRetry, userRole }) => {
  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen bg-yellow-50">
      <Sidebar />
      <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
        <ChatHeader userRole={userRole} />
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    </div>
  );
};

export default ErrorPage;