import React, { useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TablePagination,
} from "@mui/material";

function ProductTable({ products }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedProducts = products.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Paper elevation={3} sx={{ mt: 4 }}>
            <h3 style={{ padding: "16px" }}>All Products</h3>
            <TableContainer>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                        <TableRow>
                            <TableCell><strong>Code</strong></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Price</strong></TableCell>
                            <TableCell><strong>Stock</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedProducts.map((prod) => (
                            <TableRow key={prod.id}>
                                <TableCell>{prod.code}</TableCell>
                                <TableCell>{prod.name}</TableCell>
                                <TableCell>₹ {prod.price}</TableCell>
                                <TableCell>{prod.product_quantity}</TableCell>
                            </TableRow>
                        ))}
                        {paginatedProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={products.length}
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
