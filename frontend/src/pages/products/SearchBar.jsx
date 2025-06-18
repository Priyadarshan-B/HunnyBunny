// components/Products/SearchBar.jsx
import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const SearchBar = ({ searchTerm, handleSearch, loading }) => (
    <Input
        prefix={<SearchOutlined />}
        placeholder="Search by name or code"
        allowClear
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        disabled={loading}
        style={{
            marginBottom: 24,
            width: 400,
            backgroundColor: "var(--background-1)",
            border: "1px solid var(--border-color)",
            color: "var(--text)",
            borderRadius: "5px"
        }}
    />
);

export default SearchBar;
