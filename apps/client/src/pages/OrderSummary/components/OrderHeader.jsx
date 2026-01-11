/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
const OrderHeader = ({ orderId, status }) => {
  return (
    <header className="flex justify-between items-center pb-6 border-b border-amber-200 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-amber-900">Order Details</h1>
        <p className="text-amber-700">Order #{orderId}</p>
      </div>
      <div className="inline-block bg-yellow-400 text-gray-800 px-4 py-2 rounded-full font-semibold text-sm">
        {status}
      </div>
    </header>
  );
};

export default OrderHeader;
