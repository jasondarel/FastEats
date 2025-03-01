import React from "react";

const MenuStats = ({ menu }) => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Menu Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Created</p>
          <p className="font-medium">
            {new Date(menu.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Last Updated</p>
          <p className="font-medium">
            {new Date(menu.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuStats;
