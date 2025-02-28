// src/utils/errorHandling.js
import Swal from "sweetalert2";

export const handleApiError = (error, navigate) => {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 400) {
      if (data.errors) {
        const validationErrors = Object.values(data.errors)
          .map((msg) => `• ${msg}`)
          .join("\n");
        Swal.fire({
          title: "Validation Error",
          text: validationErrors,
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#efb100",
        });
      } else if (data.message) {
        Swal.fire({
          title: "Error",
          text: data.message,
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#efb100",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Invalid request. Please check your input.",
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#efb100",
        });
      }
    } else if (status === 401) {
      Swal.fire({
        title: "Unauthorized!",
        text: "Please log in again.",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
    } else {
      Swal.fire({
        title: "Error",
        text:
          data.message ||
          "An unexpected error occurred. Please try again later.",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#efb100",
      });
    }
  } else {
    // Handle network errors or other issues where response isn't available
    Swal.fire({
      title: "Error",
      text: error.message || "Network error. Please check your connection.",
      icon: "error",
      confirmButtonText: "Ok",
      confirmButtonColor: "#efb100",
    });
  }
};
