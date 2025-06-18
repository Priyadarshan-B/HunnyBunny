import React, { useEffect, useState } from 'react';
import {
    Box,
    Collapse,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';
import requestApi from '../../components/utils/axios';

function History() {
    return <BillHistoryTable />;
}

function BillHistoryTable() {
    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const billsPerPage = 5;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const url = debouncedSearch
                    ? `/bills/bill-details?name=${debouncedSearch}`
                    : `/bills/bill-details`;
                const response = await requestApi("GET",url);
                setBills(response.data);
            } catch (error) {
                console.error('Error fetching bills:', error);
            }
        };
        fetchBills();
    }, [debouncedSearch]);

    const indexOfLast = currentPage * billsPerPage;
    const indexOfFirst = indexOfLast - billsPerPage;
    const currentBills = bills.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(bills.length / billsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <Box sx={{ paddingX: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Customer Bills
            </Typography>

            <input
                type="text"
                placeholder="Search Customer Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: '30%',
                    padding: '10px',
                    fontSize: '16px',
                    marginBottom: '20px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--background-1)',
                }}
            />

            <TableContainer component={Paper} sx={{ padding: "10px 10px 0px 10px", backgroundColor: "var(--background-1)" }}>
                <Table aria-label="collapsible table" sx={{ backgroundColor: 'var(--background-1)' }}>
                    <TableHead sx={{ backgroundColor: "var(--table-header)" }}>
                        <TableRow>
                            <TableCell />
                            <TableCell sx={{ color: "var(--text)", fontWeight: "bold" }}>BILL ID</TableCell>
                            <TableCell sx={{ color: "var(--text)", fontWeight: "bold" }}>CUSTOMER NAME</TableCell>
                            <TableCell sx={{ color: "var(--text)", fontWeight: "bold" }}>PAYMENT METHOD</TableCell>
                            <TableCell sx={{ color: "var(--text)", fontWeight: "bold" }}>DATE</TableCell>
                            <TableCell sx={{ color: "var(--text)", fontWeight: "bold" }}>TOTAL AMOUNT</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentBills.map((bill, index) => (
                            <Row key={index} bill={bill} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--background-1)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <Typography variant="body1">
                    Page {currentPage} of {totalPages}
                </Typography>
                <div>
                    <Button onClick={handlePrev} disabled={currentPage === 1}>
                        Previous
                    </Button>
                    <Button onClick={handleNext} disabled={currentPage === totalPages}>
                        Next
                    </Button>
                </div>
            </Box>
        </Box>
    );
}

function Row({ bill }) {
    const [open, setOpen] = useState(false);

    const total = (bill.items || []).reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
    );

    const formattedDate = new Date(bill.date).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <>
            <TableRow>
                <TableCell>
                    <IconButton
                        sx={{ color: "var(--text)" }}
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ color: "var(--text)" }}>{bill.bill_id}</TableCell>
                <TableCell sx={{ color: "var(--text)" }}>{bill.customer_name}</TableCell>
                <TableCell sx={{ color: "var(--text)" }}>{bill.payment_method}</TableCell>
                <TableCell sx={{ color: "var(--text)" }}>{formattedDate}</TableCell>
                <TableCell sx={{ color: "var(--text)" }}>₹{total.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ padding: '10px', border: '1px solid var(--border-color)', margin: "10px 100px", borderRadius: '4px', padding: "10px 10px 0px 10px" }}>
                            <Table size="small" aria-label="items">
                                <TableHead sx={{ backgroundColor: "var(--table-header)" }}>
                                    <TableRow>
                                        <TableCell sx={{ color: "var(--text)", fontWeight: "bold" }}>Product Name</TableCell>
                                        <TableCell align="right" sx={{ color: "var(--text)", fontWeight: "bold" }}>Quantity</TableCell>
                                        <TableCell align="right" sx={{ color: "var(--text)", fontWeight: "bold" }}>Unit Price</TableCell>
                                        <TableCell align="right" sx={{ color: "var(--text)", fontWeight: "bold" }}>Subtotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(bill.items || []).map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ color: "var(--text)", padding: "10px" }}>{item.product_name}</TableCell>
                                            <TableCell align="right" sx={{ color: "var(--text)" }}>{item.quantity}</TableCell>
                                            <TableCell align="right" sx={{ color: "var(--text)" }}>₹{item.unit_price}</TableCell>
                                            <TableCell align="right" sx={{ color: "var(--text)" }}>₹{(item.unit_price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div style={{ fontSize: "18px", display: "flex", justifyContent: "flex-end", padding: "10px", color: "var(--text)" }}>
                                <b>Total amount:</b>  ₹{total.toFixed(2)}
                            </div>

                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default History;
