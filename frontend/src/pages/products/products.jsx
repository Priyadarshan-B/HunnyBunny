import React, { useEffect, useState, useCallback, useMemo } from "react";
import { message, Skeleton } from "antd";
import { debounce } from "lodash";
import requestApi from "../../components/utils/axios";
import StickerModal from "../../components/stickerModal/stickerModal";
import SearchBar from "./SearchBar";
import ProductCard from "./ProductCard";
import EditProductModal from "./EditProductModal";
import "./products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true); // Specific loading state for products
  const [initialLoad, setInitialLoad] = useState(true); // To prevent skeleton on initial search
  const [editStates, setEditStates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stickerCount, setStickerCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentEditState, setCurrentEditState] = useState({});

  const fetchProducts = async (term = "") => {
    try {
      setProductsLoading(true);
      const res = await requestApi("GET", `/products/qr_products?term=${term}`);
      setProducts(res.data);
      console.log("Fetched products:", res.data);
      const initialStates = {};
      res.data.forEach((prod) => {
        initialStates[prod.id] = {
          qty: null,
          pkd: null,
          exp: null,
          editing: false,
        };
      });
      setEditStates(initialStates);
    } catch {
      message.error("Failed to fetch products");
      // setSearchTerm(""); 
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

  useEffect(() => {
    fetchProducts();
    fetchQuantity();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        fetchProducts(value);
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

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        handleSearch={handleSearch}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {initialLoad || productsLoading ? ( // Show skeleton only on initial load or during product fetching
          [...Array(searchTerm ? products.length : 8)].map((_, index) => ( // Adjust skeleton count
            <div
              key={index}
              style={{
                width: 240,
                padding: 16,
                border: "1px solid #f0f0f0",
                borderRadius: 8,
              }}
            >
              <Skeleton.Image
                style={{ width: 150, height: 150, marginBottom: 12 }}
              />
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