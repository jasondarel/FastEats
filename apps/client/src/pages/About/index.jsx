import React, { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <BackButton />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div
        className={`relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4 animate-pulse">
            FastEats
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        <h2 className="text-2xl md:text-4xl font-semibold text-amber-800 mb-6 max-w-4xl leading-relaxed">
          Connecting Food Lovers with Amazing Restaurants
        </h2>

        <p className="text-lg md:text-xl text-amber-700 max-w-3xl mb-12 leading-relaxed">
          The ultimate platform for seamless food ordering, bringing together
          hungry customers and passionate food sellers in one delicious
          ecosystem.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-amber-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <span className="text-amber-800 font-semibold">
              🍕 For Customers
            </span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-amber-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <span className="text-amber-800 font-semibold">
              🏪 For Restaurants
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-amber-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-amber-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const MissionSection = () => {
  return (
    <div className="py-20 bg-gradient-to-r from-amber-100 to-orange-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-800 mb-6">
            Our Mission
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-amber-700 max-w-4xl mx-auto leading-relaxed">
            To revolutionize the food ordering experience by creating a seamless
            bridge between food enthusiasts and culinary creators, making great
            food accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-200 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-amber-800 mb-4">
              Innovation
            </h3>
            <p className="text-amber-700 leading-relaxed">
              Constantly pushing boundaries to deliver cutting-edge solutions
              that make food ordering effortless and enjoyable.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-200 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-amber-800 mb-4">
              Community
            </h3>
            <p className="text-amber-700 leading-relaxed">
              Building strong relationships between customers and restaurants,
              fostering a thriving food community.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-200 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-amber-800 mb-4">Speed</h3>
            <p className="text-amber-700 leading-relaxed">
              Lightning-fast ordering process that gets your favorite meals to
              you quicker than ever before.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const customerFeatures = [
    {
      icon: "🔍",
      title: "Smart Search",
      desc: "Find your favorite foods instantly with our intelligent search system",
    },
    {
      icon: "💳",
      title: "Secure Payments",
      desc: "Multiple payment options with bank-level security",
    },
    {
      icon: "📱",
      title: "Real-time Tracking",
      desc: "Track your order from kitchen to your doorstep",
    },
    {
      icon: "⭐",
      title: "Reviews & Ratings",
      desc: "Make informed choices with community reviews",
    },
  ];

  const sellerFeatures = [
    {
      icon: "📊",
      title: "Analytics Dashboard",
      desc: "Comprehensive insights into your business performance",
    },
    {
      icon: "🏪",
      title: "Easy Store Setup",
      desc: "Get your restaurant online in minutes, not hours",
    },
    {
      icon: "📝",
      title: "Order Management",
      desc: "Streamlined system to handle all incoming orders",
    },
    {
      icon: "💰",
      title: "Revenue Tracking",
      desc: "Monitor your earnings and growth in real-time",
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-800 mb-6">
            What We Offer
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="mb-20">
          <h3 className="text-3xl font-bold text-amber-800 mb-12 text-center">
            For Food Lovers
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-amber-800 mb-3">
                  {feature.title}
                </h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-amber-800 mb-12 text-center">
            For Restaurant Owners
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellerFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-amber-800 mb-3">
                  {feature.title}
                </h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CTASection = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-amber-800 mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-amber-700 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of satisfied customers and successful restaurant
          partners. Your culinary adventure awaits!
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={() => (window.location.href = "/login")}
            className="group bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:cursor-pointer active:scale-95 active:bg-gradient-to-r active:from-amber-600 active:to-orange-600"
          >
            <span className="flex items-center gap-2">
              Order Now
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                🍽️
              </span>
            </span>
          </button>

          <button
            onClick={() => (window.location.href = "/register")}
            className="group bg-white text-amber-700 border-2 border-amber-500 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-amber-50 transform hover:scale-105 transition-all duration-300 hover:cursor-pointer active:scale-95 active:bg-amber-100 active:border-amber-600"
          >
            <span className="flex items-center gap-2">
              Join as Partner
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                🏪
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <MissionSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default About;
