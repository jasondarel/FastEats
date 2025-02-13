import Sidebar from "../components/Sidebar";

const Home = () => {
  return (
    <div className="flex ml-64">
      <Sidebar />
      <main className="flex-1 p-5">
        <h1 className="text-2xl font-bold">Welcome to Home</h1>
        <p className="mt-2 text-gray-700">This is the home page content.</p>
      </main>
    </div>
  );
};

export default Home;
