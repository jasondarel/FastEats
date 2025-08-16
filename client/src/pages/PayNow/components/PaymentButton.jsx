/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const PaymentButton = ({ onPay, snapToken }) => {
  return (
    <button onClick={onPay} disabled={!snapToken}>
      {snapToken ? "Bayar Sekarang" : "Memuat..."}
    </button>
  );
};

export default PaymentButton;
