import React, { useEffect, useState, useCallback, useMemo } from "react";
import { message, Skeleton } from "antd";
import { debounce } from "lodash";
import requestApi from "../../components/utils/axios";
import StickerModal from "../../components/stickerModal/stickerModal";
import SearchBar from "./SearchBar";
import ProductCard from "./ProductCard";
import EditProductModal from "./EditProductModal";
import "./products.css";
import { jwtDecode } from "jwt-decode";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editStates, setEditStates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stickerCount, setStickerCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentEditState, setCurrentEditState] = useState({});
  const [displayLocation, setDisplayLocation] = useState("");

  const LIMIT = 10;

  useEffect(() => {
    const token = localStorage.getItem("D!");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setDisplayLocation(decoded?.lname || "");
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  const fetchProducts = async (page = 1, term = "") => {
    if (productsLoading) return;

    try {
      setProductsLoading(true);
      const res = await requestApi(
        "GET",
        `/products/qr_products?term=${encodeURIComponent(term)}&page=${page}&limit=${LIMIT}`
      );

      const newProducts = res.data?.data || [];

      setProducts((prev) => (page === 1 ? newProducts : [...prev, ...newProducts]));

      const newEditStates = {};
      newProducts.forEach((prod) => {
        newEditStates[prod.id] = {
          qty: null,
          pkd: null,
          exp: null,
          editing: false,
        };
      });
      setEditStates((prev) => (page === 1 ? newEditStates : { ...prev, ...newEditStates }));

      const total = res.data?.total || 0;
      const loaded = page * LIMIT;
      setHasMore(loaded < total);
      setCurrentPage(page);
    } catch (error) {
      message.error("Failed to fetch products");
    } finally {
      setProductsLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchQuantity = async () => {
    try {
      const res = await requestApi("GET", "/products/qty");
      const formatted = res.data.map((qty) => ({
        value: qty.quantity,
        label: `${qty.quantity} - ${qty.expansion}`,
      }));
      setQuantity(formatted);
    } catch (error) {
      console.error("Failed to fetch quantities:", error);
    }
  };

  // On first mount, fetch first page
  useEffect(() => {
    setProducts([]);
    setEditStates({});
    setCurrentPage(1);
    setHasMore(true);
    setInitialLoad(true);
    fetchProducts(1, searchTerm);
    fetchQuantity();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setProducts([]);
        setEditStates({});
        setCurrentPage(1);
        setHasMore(true);
        setInitialLoad(true);
        fetchProducts(1, value);
      }, 400),
    []
  );

  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setCurrentEditState(editStates[product.id]);
    setEditModalVisible(true);
  };

  const handleModalSave = () => {
    if (!currentProduct) return;
    const id = currentProduct.id;
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...currentEditState, editing: false },
    }));
    setEditModalVisible(false);
  };

  const handleCancel = (id) =>
    setEditStates((prev) => ({
      ...prev,
      [id]: { qty: null, pkd: null, exp: null, editing: false },
    }));

  const handleDelete = (id) =>
    setEditStates((prev) => ({
      ...prev,
      [id]: { qty: null, pkd: null, exp: null, editing: false },
    }));

  const handleQtyChange = (id, value) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], qty: value },
    }));
  };

  const handleDateChange = (id, type, _, dateString) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], [type]: dateString },
    }));
  };

  const openStickerModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
    setStickerCount(1);
  };

 useEffect(() => {
  const scrollContainer = document.getElementById("app-body"); 

  if (!scrollContainer) return;

  const handleScroll = () => {
    const nearBottom =
      scrollContainer.scrollTop + scrollContainer.clientHeight + 300 >= scrollContainer.scrollHeight;

    if (nearBottom && hasMore && !productsLoading) {
      fetchProducts(currentPage + 1, searchTerm);
    }
  };

  scrollContainer.addEventListener("scroll", handleScroll);
  return () => scrollContainer.removeEventListener("scroll", handleScroll);
}, [currentPage, hasMore, productsLoading, searchTerm]);


  return (
    <div>
      <div style={{ marginBottom: "10px", color: "var(--text)", fontWeight: "bold" }}>
        Location: {displayLocation}
      </div>

      <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {initialLoad && products.length === 0 ? (
          [...Array(8)].map((_, index) => (
            <div
              key={index}
              style={{
                width: 240,
                padding: 16,
                border: "1px solid #f0f0f0",
                borderRadius: 8,
              }}
            >
              <Skeleton.Image style={{ width: 150, height: 150, marginBottom: 12 }} />
              <Skeleton active title paragraph={{ rows: 2 }} />
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantity}
              state={editStates[product.id]}
              handleEdit={handleEdit}
              handleSave={handleModalSave}
              handleCancel={handleCancel}
              handleDelete={handleDelete}
              handleQtyChange={handleQtyChange}
              handleDateChange={handleDateChange}
              openStickerModal={openStickerModal}
            />
          ))
        ) : (
          <div style={{ width: "100%", textAlign: "center", marginTop: 20 }}>
            <h2>No products found</h2>
          </div>
        )}
      </div>

      {productsLoading && (
        <div style={{ textAlign: "center", padding: 20 }}>Loading...</div>
      )}

      <StickerModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        stickerCount={stickerCount}
        setStickerCount={setStickerCount}
        editStates={editStates}
      />

      <EditProductModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleModalSave}
        product={currentProduct}
        editState={currentEditState}
        setEditState={setCurrentEditState}
        quantityOptions={quantity}
      />
    </div>
  );
};

export default Products;
