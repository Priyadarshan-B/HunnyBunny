import React, { useState, useEffect, useRef } from 'react';
import apiHost from "../components/utils/api";



function Dashboard() {
    return <Body />;
}

function Body() {

    return (
        <div className='dashboard-page'>
            Dashboard
        </div>
    );
}

export default Dashboard;