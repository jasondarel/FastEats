import React from "react";

const PageLayout = ({ children, sidebar, backgroundStyle }) => {
  return (
    <div className="flex ml-64">
      {sidebar}
      <main
        className="flex-1 p-5 min-h-screen flex items-center justify-center"
        style={backgroundStyle}
      >
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
