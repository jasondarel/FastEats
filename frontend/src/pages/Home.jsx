// Ensure Sidebar component exists and is correctly implemented
// Example Sidebar component
// const Sidebar = () => (
//   <div className="w-64 bg-white shadow-md">
//     <h2 className="text-xl font-bold p-4">Sidebar</h2>
//   </div>
// );

const Home = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold">Welcome to FastEats</h1>
        <p className="text-gray-700 mt-2">
          Your favorite food, delivered fast.
        </p>
      </div>
    </div>
  );
};

export default Home;
