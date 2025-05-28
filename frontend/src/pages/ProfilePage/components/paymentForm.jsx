/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FaMoneyBillAlt,
  FaWallet,
  FaExclamationCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { API_URL } from "../../../config/api";

const PaymentForm = () => {
    const [bcaAccount, setBcaAccount] = useState("");
    const [gopay, setGopay] = useState("");
    const [dana, setDana] = useState("");
    const [isChanged, setIsChanged] = useState(false);
    const token = localStorage.getItem("token");

    const [errors, setErrors] = useState({
        bcaAccount: "",
        gopay: "",
        dana: "",
    });

    const [isFormValid, setIsFormValid] = useState(false);
    
    // Fetch current payment data on component mount
    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                const response = await fetch(`${API_URL}/user/user-payment`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch payment data');
                }

                const data = await response.json();
                setBcaAccount(data.user.bank_bca || "");
                setGopay(data.user.gopay || "");
                setDana(data.user.dana || "");
            } catch (err) {
                console.error("Error fetching payment data:", err);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load payment information",
                    icon: "error",
                    confirmButtonText: "Ok",
                    confirmButtonColor: "#ef4444",
                });
            }
        };

        fetchPaymentData();
    }, [token]);

    // Validation effect
    useEffect(() => {
        let newErrors = {
            bcaAccount: "",
            gopay: "",
            dana: "",
        };

        // BCA Account validation (10 digits)
        if (bcaAccount && !/^\d{10}$/.test(bcaAccount)) {
            newErrors.bcaAccount = "BCA account must be exactly 10 digits";
        }

        if (gopay && !/^\d{10,13}$/.test(gopay)) {
            newErrors.gopay = "GoPay number must be between 10 and 13 digits";
        }
        
        // DANA validation (10-13 digits)
        if (dana && !/^\d{10,13}$/.test(dana)) {
            newErrors.dana = "DANA number must be between 10 and 13 digits";
        }

        setErrors(newErrors);

        // Check if form is valid and changes were made
        const hasErrors = Object.values(newErrors).some((error) => error !== "");
        setIsFormValid(isChanged && !hasErrors);
    }, [bcaAccount, gopay, dana, isChanged]);

    const handleInputChange = (setter) => (e) => {
        const value = e.target.value.replace(/[^\d]/g, "");
        setter(value);
        setIsChanged(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFormValid) {
            try {
                const response = await fetch(`${API_URL}/user/user-payment`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ bcaAccount, gopay, dana }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update payment data');
                }

                Swal.fire({
                    title: "Success!",
                    text: "Successfully updated the payment information",
                    icon: "success",
                    confirmButtonText: "Ok",
                    confirmButtonColor: "#efb100",
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.reload();
                    }
                });
            } catch(err) {
                console.error(err);
                Swal.fire({
                    title: "Error!",
                    text: err.message,
                    icon: "error",
                    confirmButtonText: "Ok",
                    confirmButtonColor: "#ef4444",
                });
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">
                        BCA Account
                    </label>
                    <div
                        className={`flex items-center border ${
                        errors.bcaAccount ? "border-red-500" : "border-gray-300"
                        } rounded-lg shadow-sm focus-within:ring-2 ${
                        errors.bcaAccount
                            ? "focus-within:ring-red-500"
                            : "focus-within:ring-yellow-500"
                        }`}
                    >
                        <img
                            src="/bca.png"
                            alt="BCA"
                            className="ml-3 w-6 h-6" 
                        />
                        <input
                        type="text"
                        placeholder="Enter your BCA account number (10 digits)"
                        value={bcaAccount}
                        onChange={handleInputChange(setBcaAccount)}
                        required
                        maxLength={10}
                        className="w-full p-3 focus:outline-none"
                        />
                        {errors.bcaAccount && (
                        <FaExclamationCircle className="mr-3 text-red-500" />
                        )}
                    </div>
                    {errors.bcaAccount && (
                        <p className="mt-1 text-red-500 text-sm">{errors.bcaAccount}</p>
                    )}
                </div>
        
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">GoPay</label>
                    <div
                        className={`flex items-center border ${
                        errors.gopay ? "border-red-500" : "border-gray-300"
                        } rounded-lg shadow-sm focus-within:ring-2 ${
                        errors.gopay
                            ? "focus-within:ring-red-500"
                            : "focus-within:ring-yellow-500"
                        }`}
                    >
                        <img
                            src="/gopay.png"
                            alt="GoPay"
                            className="ml-3 w-6 h-6" 
                        />
                        <input
                        type="text"
                        placeholder="Enter your GoPay number (10-13 digits)"
                        value={gopay}
                        onChange={handleInputChange(setGopay)}
                        required
                        maxLength={13}
                        className="w-full p-3 focus:outline-none"
                        />
                        {errors.gopay && (
                        <FaExclamationCircle className="mr-3 text-red-500" />
                        )}
                    </div>
                    {errors.gopay && (
                        <p className="mt-1 text-red-500 text-sm">{errors.gopay}</p>
                    )}
                </div>
        
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">DANA</label>
                    <div
                        className={`flex items-center border ${
                        errors.dana ? "border-red-500" : "border-gray-300"
                        } rounded-lg shadow-sm focus-within:ring-2 ${
                        errors.dana
                            ? "focus-within:ring-red-500"
                            : "focus-within:ring-yellow-500"
                        }`}
                    >
                        <img
                            src="/dana.png"
                            alt="DANA"
                            className="ml-2 w-7" 
                        />
                        <input
                        type="text"
                        placeholder="Enter your DANA number (10-13 digits)"
                        value={dana}
                        onChange={handleInputChange(setDana)}
                        required
                        maxLength={13}
                        className="w-full p-3 focus:outline-none"
                        />
                        {errors.dana && <FaExclamationCircle className="mr-3 text-red-500" />}
                    </div>
                    {errors.dana && (
                        <p className="mt-1 text-red-500 text-sm">{errors.dana}</p>
                    )}
                </div>
        
                <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full p-3 rounded-lg transition ${
                    isFormValid
                    ? "bg-red-500 text-white hover:bg-red-600 hover:cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                >
                Update Payment Data
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;