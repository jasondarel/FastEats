import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import ChatHeader from "./components/ChatHeader";

const LoadingPage = () => {
  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen bg-yellow-50">
      <Sidebar />
      <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
        <ChatHeader userRole="user" />
        <div className="w-full flex justify-center">
          <LoadingState />
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;