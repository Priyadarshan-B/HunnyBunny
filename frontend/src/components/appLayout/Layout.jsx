import React, { useState } from "react";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import "./Layout.css";

function AppLayout(props) {
  const [sidebarState, setSideBarState] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const handleSideBar = () => {
    setSideBarState(!sidebarState);
  };

  return (
    <div
      style={{
        backgroundColor: "#ecebf3",
        height: "100vh",
        width: "100vw",
        position: "fixed",
      }}
    >
      <TopBar sidebar={handleSideBar} lowStockProducts={lowStockProducts} />
      <div style={{ height: "100%", display: "flex" }}>
        <SideBar
          open={sidebarState}
          resource={props.rId}
          handleSideBar={handleSideBar}
        />
        <div className="app-body" id="app-body" style={{ width: "100%" }}>
          {/* Clone props.body and pass the setter */}
          {React.cloneElement(props.body, { setLowStockProducts })}
        </div>
      </div>
    </div>
  );
}
export default AppLayout;
