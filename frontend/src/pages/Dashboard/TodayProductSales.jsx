import React, { useEffect, useState } from "react";
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Box, Typography, TablePagination
} from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 15];

const TodayProductSales = () => {
    const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchSales = async (selectedDate) => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/dashboard/tdy-products?date=${selectedDate}`);
            setSales(res.data);
        } catch (err) {
            console.error("Failed to fetch sales data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales(date);
        setPage(0); // reset to page 0 when date changes
    }, [date]);

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedSales = sales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper elevation={3} sx={{ mt: 1.5, p: 2, flex: "1", backgroundColor: "var(--background-1)" }}>
            <Box sx={{ backgroundColor: "var(--background-1)", color: "var(--text)" }} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Sales Summary</Typography>
                <TextField
                    type="date"
                    size="small"
                    value={date}
                    onChange={handleDateChange}
                />
            </Box>

            <TableContainer sx={{ backgroundColor: "var(--background-1)", color: "var(--text)" }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "var(--background-1)" }}>
                        <TableRow>
                            <TableCell sx={{ color: "var(--text)" }}><strong>Product Name</strong></TableCell>
                            <TableCell sx={{ color: "var(--text)" }}><strong>Quantity</strong></TableCell>
                            <TableCell sx={{ color: "var(--text)" }}><strong>Total Price</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedSales.length > 0 ? (
                            paginatedSales.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ color: "var(--text)" }}>{item.product_name}</TableCell>
                                    <TableCell sx={{ color: "var(--text)" }}>{item.quantity}</TableCell>
                                    <TableCell sx={{ color: "var(--text)" }}>₹ {item.total_price}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell sx={{ color: "var(--text)" }} colSpan={3} align="center">
                                    {loading ? "Loading..." : "No data found"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                sx={{ color: "var(--text)" }}
                component="div"
                count={sales.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            />
        </Paper>
    );
};

export default TodayProductSales;
