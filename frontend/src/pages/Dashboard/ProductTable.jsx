import React, { useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TablePagination,
    TextField, Box
} from "@mui/material";

function ProductTable({ products }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
        setPage(0); 
    };

    const filteredProducts = products.filter(
        (prod) =>
            prod.name.toLowerCase().includes(searchTerm) ||
            prod.code.toLowerCase().includes(searchTerm)
    );

    const paginatedProducts = filteredProducts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Paper elevation={3} sx={{ mt: 1.5, p: 2, backgroundColor: "var(--background-1)", color: "var(--text)", flex:"2" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <h3 style={{ margin: 0, fontWeight: "700" }}>All Products</h3>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by name or code"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ color: "var(--text)" }}
                />
            </Box>

            <TableContainer >
                <Table>
                    <TableHead sx={{ backgroundColor: "var(--background-1)" }}>
                        <TableRow>
                            <TableCell sx={{ color: "var(--text)" }}><strong>Code</strong></TableCell>
                            <TableCell sx={{ color: "var(--text)" }}><strong>Name</strong></TableCell>
                            <TableCell sx={{ color: "var(--text)" }}><strong>Price</strong></TableCell>
                            <TableCell sx={{ color: "var(--text)" }}><strong>Stock</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedProducts.map((prod) => (
                            <TableRow key={prod.id}>
                                <TableCell sx={{ color: "var(--text)" }}>{prod.code}</TableCell>
                                <TableCell sx={{ color: "var(--text)" }}>{prod.name}</TableCell>
                                <TableCell sx={{ color: "var(--text)" }}>₹ {prod.price}</TableCell>
                                <TableCell sx={{ color: "var(--text)" }}>{prod.product_quantity}</TableCell>
                            </TableRow>
                        ))}
                        {paginatedProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: "var(--text)" }}>
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                sx={{ color: "var(--text)" }}
                component="div"
                count={filteredProducts.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 15, 25, 50]}
            />
        </Paper>
    );
}

export default ProductTable;
