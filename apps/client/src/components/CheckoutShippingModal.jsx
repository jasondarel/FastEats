/* eslint-disable react/prop-types */
import { useCallback, useState } from "react";
import OrderShipping from "../pages/OrderDetails/components/OrderShipping";

const buildShippingPayload = (data = {}) => ({
  shipping_province: data.province,
  shipping_city: data.city,
  shipping_district: data.district,
  shipping_village: data.village,
  shipping_address: data.address,
  shipping_phone: data.phone,
  shipping_name: data.fullName,
});

const CheckoutShippingModal = ({
  open,
  confirming = false,
  onClose,
  onConfirm,
}) => {
  const [selection, setSelection] = useState(null);

  const handleValidation = useCallback((isValid) => {
    setSelection((prev) => ({ ...(prev || {}), isValid }));
  }, []);

  const handleData = useCallback((payload) => {
    setSelection(payload);
  }, []);

  if (!open) return null;

  const data = selection?.shippingData || {};
  const ready =
    selection?.isValid &&
    data.province &&
    data.city &&
    data.district &&
    data.village &&
    data.address?.trim() &&
    data.fullName?.trim() &&
    data.phone?.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-900">
            Delivery Information
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
          >
            Close
          </button>
        </div>

        <div className="px-6 pb-6">
          <OrderShipping
            onShippingValidationChange={handleValidation}
            onShippingDataChange={handleData}
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={confirming}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(buildShippingPayload(data))}
              disabled={!ready || confirming}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
                !ready || confirming
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {confirming ? "Placing order..." : "Confirm & Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutShippingModal;
