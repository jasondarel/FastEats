import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import ImageUploader from "./ImageUploader";

const indonesianProvinces = [
  { id: "31", name: "DKI Jakarta" },
  { id: "32", name: "Jawa Barat" },
  { id: "33", name: "Jawa Tengah" },
];

const indonesianCities = {
  31: [
    { id: "3171", name: "Jakarta Selatan" },
    { id: "3172", name: "Jakarta Timur" },
    { id: "3173", name: "Jakarta Pusat" },
  ],
  32: [
    { id: "3201", name: "Bogor" },
    { id: "3273", name: "Kota Bandung" },
    { id: "3275", name: "Kota Bekasi" },
  ],
  33: [
    { id: "3301", name: "Cilacap" },
    { id: "3372", name: "Kota Surakarta" },
    { id: "3374", name: "Kota Semarang" },
  ],
};

const indonesianDistricts = {
  3171: [
    // Jakarta Selatan
    { id: "317101", name: "Kebayoran Baru" },
    { id: "317102", name: "Kebayoran Lama" },
    { id: "317103", name: "Pesanggrahan" },
  ],
  3172: [
    // Jakarta Timur
    { id: "317201", name: "Pasar Rebo" },
    { id: "317202", name: "Ciracas" },
    { id: "317203", name: "Cipayung" },
  ],
  3173: [
    // Jakarta Pusat
    { id: "317301", name: "Tanah Abang" },
    { id: "317302", name: "Menteng" },
    { id: "317303", name: "Senen" },
  ],
  3201: [
    // Bogor
    { id: "320101", name: "Bogor Selatan" },
    { id: "320102", name: "Bogor Timur" },
    { id: "320103", name: "Bogor Utara" },
  ],
  3273: [
    // Bandung
    { id: "327301", name: "Bandung Wetan" },
    { id: "327302", name: "Cibeunying Kaler" },
    { id: "327303", name: "Coblong" },
  ],
  3275: [
    // Bekasi
    { id: "327501", name: "Bekasi Timur" },
    { id: "327502", name: "Bekasi Barat" },
    { id: "327503", name: "Bekasi Selatan" },
  ],
  3301: [
    // Cilacap
    { id: "330101", name: "Cilacap Selatan" },
    { id: "330102", name: "Cilacap Tengah" },
    { id: "330103", name: "Cilacap Utara" },
  ],
  3372: [
    // Surakarta
    { id: "337201", name: "Laweyan" },
    { id: "337202", name: "Serengan" },
    { id: "337203", name: "Pasar Kliwon" },
  ],
  3374: [
    // Semarang
    { id: "337401", name: "Semarang Selatan" },
    { id: "337402", name: "Semarang Barat" },
    { id: "337403", name: "Semarang Utara" },
  ],
};

const indonesianVillages = {
  317101: [
    // Kebayoran Baru
    { id: "31710101", name: "Petogogan" },
    { id: "31710102", name: "Pulo" },
    { id: "31710103", name: "Melawai" },
  ],
  317102: [
    // Kebayoran Lama
    { id: "31710201", name: "Cipulir" },
    { id: "31710202", name: "Grogol Utara" },
    { id: "31710203", name: "Kebayoran Lama Utara" },
  ],
  317103: [
    // Pesanggrahan
    { id: "31710301", name: "Pesanggrahan" },
    { id: "31710302", name: "Bintaro" },
    { id: "31710303", name: "Petukangan Utara" },
  ],
  317201: [
    // Pasar Rebo
    { id: "31720101", name: "Pekayon" },
    { id: "31720102", name: "Kalisari" },
    { id: "31720103", name: "Gedong" },
  ],
  317202: [
    // Ciracas
    { id: "31720201", name: "Ciracas" },
    { id: "31720202", name: "Kelapa Dua Wetan" },
    { id: "31720203", name: "Susukan" },
  ],
  317203: [
    // Cipayung
    { id: "31720301", name: "Cipayung" },
    { id: "31720302", name: "Bambu Apus" },
    { id: "31720303", name: "Ceger" },
  ],
  317301: [
    // Tanah Abang
    { id: "31730101", name: "Bendungan Hilir" },
    { id: "31730102", name: "Karet Tengsin" },
    { id: "31730103", name: "Petamburan" },
  ],
  317302: [
    // Menteng
    { id: "31730201", name: "Menteng" },
    { id: "31730202", name: "Pegangsaan" },
    { id: "31730203", name: "Cikini" },
  ],
  317303: [
    // Senen
    { id: "31730301", name: "Senen" },
    { id: "31730302", name: "Paseban" },
    { id: "31730303", name: "Kramat" },
  ],
  320101: [
    // Bogor Selatan
    { id: "32010101", name: "Mulyaharja" },
    { id: "32010102", name: "Bantarjati" },
    { id: "32010103", name: "Muarasari" },
  ],
  320102: [
    // Bogor Timur
    { id: "32010201", name: "Baranangsiang" },
    { id: "32010202", name: "Katulampa" },
    { id: "32010203", name: "Tajur" },
  ],
  320103: [
    // Bogor Utara
    { id: "32010301", name: "Tegalega" },
    { id: "32010302", name: "Ciparigi" },
    { id: "32010303", name: "Kedung Badak" },
  ],
  327301: [
    // Bandung Wetan
    { id: "32730101", name: "Cihapit" },
    { id: "32730102", name: "Citarum" },
    { id: "32730103", name: "Tamansari" },
  ],
  327302: [
    // Cibeunying Kaler
    { id: "32730201", name: "Cigadung" },
    { id: "32730202", name: "Cihaurgeulis" },
    { id: "32730203", name: "Neglasari" },
  ],
  327303: [
    // Coblong
    { id: "32730301", name: "Cipaganti" },
    { id: "32730302", name: "Dago" },
    { id: "32730303", name: "Lebak Gede" },
  ],
  327501: [
    // Bekasi Timur
    { id: "32750101", name: "Aren Jaya" },
    { id: "32750102", name: "Bekasi Jaya" },
    { id: "32750103", name: "Duren Jaya" },
  ],
  327502: [
    // Bekasi Barat
    { id: "32750201", name: "Bintara" },
    { id: "32750202", name: "Jakasampurna" },
    { id: "32750203", name: "Kota Baru" },
  ],
  327503: [
    // Bekasi Selatan
    { id: "32750301", name: "Jakasetia" },
    { id: "32750302", name: "Pekayon Jaya" },
    { id: "32750303", name: "Margajaya" },
  ],
  330101: [
    // Cilacap Selatan
    { id: "33010101", name: "Cilacap" },
    { id: "33010102", name: "Sidanegara" },
    { id: "33010103", name: "Tambakreja" },
  ],
  330102: [
    // Cilacap Tengah
    { id: "33010201", name: "Tritih Lor" },
    { id: "33010202", name: "Donan" },
    { id: "33010203", name: "Kalipucang" },
  ],
  330103: [
    // Cilacap Utara
    { id: "33010301", name: "Sidakaya" },
    { id: "33010302", name: "Tegalreja" },
    { id: "33010303", name: "Mertasinga" },
  ],
  337201: [
    // Laweyan
    { id: "33720101", name: "Laweyan" },
    { id: "33720102", name: "Bumi" },
    { id: "33720103", name: "Penumping" },
  ],
  337202: [
    // Serengan
    { id: "33720201", name: "Serengan" },
    { id: "33720202", name: "Tipes" },
    { id: "33720203", name: "Kratonan" },
  ],
  337203: [
    // Pasar Kliwon
    { id: "33720301", name: "Pasar Kliwon" },
    { id: "33720302", name: "Joyosuran" },
    { id: "33720303", name: "Kampung Baru" },
  ],
  337401: [
    // Semarang Selatan
    { id: "33740101", name: "Lamper Kidul" },
    { id: "33740102", name: "Mugassari" },
    { id: "33740103", name: "Peterongan" },
  ],
  337402: [
    // Semarang Barat
    { id: "33740201", name: "Kemijen" },
    { id: "33740202", name: "Krobokan" },
    { id: "33740203", name: "Manyaran" },
  ],
  337403: [
    // Semarang Utara
    { id: "33740301", name: "Bandarharjo" },
    { id: "33740302", name: "Kuningan" },
    { id: "33740303", name: "Plombokan" },
  ],
};

const RegisterForm = ({ onRegister, errors, userType }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantProvinsi, setRestaurantProvinsi] = useState("");
  const [restaurantKota, setRestaurantKota] = useState("");
  const [restaurantKecamatan, setRestaurantKecamatan] = useState("");
  const [restaurantKelurahan, setRestaurantKelurahan] = useState("");
  const [restaurantAlamat, setRestaurantAlamat] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [availableCities, setAvailableCities] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableVillages, setAvailableVillages] = useState([]);

  useEffect(() => {
    if (restaurantProvinsi) {
      const cities = indonesianCities[restaurantProvinsi] || [];
      setAvailableCities(cities);
      setRestaurantKota("");
      setRestaurantKecamatan("");
      setRestaurantKelurahan("");
      setAvailableDistricts([]);
      setAvailableVillages([]);
    } else {
      setAvailableCities([]);
      setRestaurantKota("");
      setRestaurantKecamatan("");
      setRestaurantKelurahan("");
      setAvailableDistricts([]);
      setAvailableVillages([]);
    }
  }, [restaurantProvinsi]);

  useEffect(() => {
    if (restaurantKota) {
      const districts = indonesianDistricts[restaurantKota] || [];
      setAvailableDistricts(districts);
      setRestaurantKecamatan("");
      setRestaurantKelurahan("");
      setAvailableVillages([]);
    } else {
      setAvailableDistricts([]);
      setRestaurantKecamatan("");
      setRestaurantKelurahan("");
      setAvailableVillages([]);
    }
  }, [restaurantKota]);

  useEffect(() => {
    if (restaurantKecamatan) {
      const villages = indonesianVillages[restaurantKecamatan] || [];
      setAvailableVillages(villages);
      setRestaurantKelurahan("");
    } else {
      setAvailableVillages([]);
      setRestaurantKelurahan("");
    }
  }, [restaurantKecamatan]);

  const handleImageChange = (file) => {
    if (file) {
      setRestaurantImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const additionalData = {};

    if (userType === "seller") {
      if (!restaurantImage) {
        onRegister(name, email, password, confirmPassword, null, {
          image: "Please upload a restaurant image",
        });
        return;
      }

      if (
        !restaurantProvinsi ||
        !restaurantKota ||
        !restaurantKecamatan ||
        !restaurantKelurahan ||
        !restaurantAlamat.trim()
      ) {
        onRegister(name, email, password, confirmPassword, null, {
          general: "Please fill in all address fields",
        });
        return;
      }

      const selectedProvinsi = indonesianProvinces.find(
        (p) => p.id === restaurantProvinsi
      );
      const selectedKota = availableCities.find((c) => c.id === restaurantKota);
      const selectedKecamatan = availableDistricts.find(
        (d) => d.id === restaurantKecamatan
      );
      const selectedKelurahan = availableVillages.find(
        (v) => v.id === restaurantKelurahan
      );

      const fullAddress = `${restaurantAlamat}, ${
        selectedKelurahan?.name || ""
      }, ${selectedKecamatan?.name || ""}, ${selectedKota?.name || ""}, ${
        selectedProvinsi?.name || ""
      }`;

      additionalData.restaurantName = restaurantName;
      additionalData.restaurantAddress = fullAddress;
      additionalData.restaurantProvinsi = restaurantProvinsi;
      additionalData.restaurantKota = restaurantKota;
      additionalData.restaurantKecamatan = restaurantKecamatan;
      additionalData.restaurantKelurahan = restaurantKelurahan;
      additionalData.restaurantAlamat = restaurantAlamat;
      additionalData.restaurantImage = restaurantImage;
    }

    onRegister(name, email, password, confirmPassword, additionalData);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-6 hover:cursor-pointer">
        Register as {userType === "user" ? "Customer" : "Seller"}
      </h2>

      {userType === "user" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <ErrorMessage error={errors.name} />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <ErrorMessage error={errors.email} />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <ErrorMessage error={errors.password} />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <ErrorMessage error={errors.confirmPassword} />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
          >
            Register
          </button>
          <ErrorMessage error={errors.general} center />
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <ErrorMessage error={errors.name} />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <ErrorMessage error={errors.email} />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <ErrorMessage error={errors.password} />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <ErrorMessage error={errors.confirmPassword} />
              </div>
            </div>

            {/* Right Column - Restaurant Information */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Restaurant Name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <ErrorMessage error={errors.restaurantName} />
              </div>

              {/* Address Fields */}
              <div>
                <select
                  value={restaurantProvinsi}
                  onChange={(e) => setRestaurantProvinsi(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  <option value="">Select Province</option>
                  {indonesianProvinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={errors.restaurantProvinsi} />
              </div>

              <div>
                <select
                  value={restaurantKota}
                  onChange={(e) => setRestaurantKota(e.target.value)}
                  required
                  disabled={!restaurantProvinsi}
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white disabled:bg-gray-100"
                >
                  <option value="">Select City/Regency</option>
                  {availableCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={errors.restaurantKota} />
              </div>

              <div>
                <select
                  value={restaurantKecamatan}
                  onChange={(e) => setRestaurantKecamatan(e.target.value)}
                  required
                  disabled={!restaurantKota}
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white disabled:bg-gray-100"
                >
                  <option value="">Select District</option>
                  {availableDistricts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={errors.restaurantKecamatan} />
              </div>

              <div>
                <select
                  value={restaurantKelurahan}
                  onChange={(e) => setRestaurantKelurahan(e.target.value)}
                  required
                  disabled={!restaurantKecamatan}
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white disabled:bg-gray-100"
                >
                  <option value="">Select Village</option>
                  {availableVillages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={errors.restaurantKelurahan} />
              </div>

              <div>
                <textarea
                  placeholder="Detailed Address (Street, House Number, etc.)"
                  value={restaurantAlamat}
                  onChange={(e) => setRestaurantAlamat(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
                <ErrorMessage error={errors.restaurantAlamat} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Image
                </label>
                <ImageUploader
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  onImageRemove={() => {
                    setImagePreview(null);
                    setRestaurantImage(null);
                  }}
                  error={errors.image}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 mt-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
          >
            Register
          </button>
          <ErrorMessage error={errors.general} center />
        </form>
      )}

      <p className="mt-4 text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-yellow-500 underline hover:text-yellow-600"
        >
          Login here
        </Link>
      </p>
    </>
  );
};

export default RegisterForm;
