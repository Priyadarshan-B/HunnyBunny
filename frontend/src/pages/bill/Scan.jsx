import React, { useState, useEffect, useRef } from 'react';
import apiHost from "../../components/utils/api";
import QRScanner from './QRScanner';




function Scan() {
    return <Body />;
}

function Body() {

    return (
        <div className='scan-page'>
            <QRScanner />
        </div>
    );
}

export default Scan;