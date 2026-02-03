import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Category = {
  id: number;
  name: string;
};

export default function VendorSignup() {
  const navigate = useNavigate();

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categorySearch, setCategorySearch] = useState("");

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [gstError, setGstError] = useState("");

  const [loading, setLoading] = useState(false);
  const validateGstNumber = () => {
    const regex = /^[A-Za-z0-9]{16}$/; // exactly 16 alphanumeric characters
    if (!regex.test(gstNumber)) {
      setGstError("GST Number must be exactly 16 alphanumeric characters.");
      return false;
    }
    setGstError(""); // valid
    return true;
  };


  // Fetch categorie
  useEffect(() => {
    axios
      .get<Category[]>(
        "http://localhost:3064/categories/get-categories"
      )
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load categories");
      });
  }, []);

  // Toggle category
  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Submit
  const handleSubmit = async () => {
    if (
      !businessName ||
      !ownerName ||
      !email ||
      !password ||
      !gstNumber || gstNumber.length < 16 ||   
      !address ||
      !bankName ||
      !accountNumber ||
      !ifscCode ||
      selectedCategories.length === 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendor: {
          businessName,
          ownerName,
          email,
          gstNumber,
          address,
          website,
          bankName,
          accountNumber,
          ifscCode,
          categories: selectedCategories,
        },
        username: email, // username = email
        password: password, // included
      };

      await axios.post(
        "http://localhost:3064/auth/register/vendor",
        payload
      );

      toast.success("Vendor account created successfully");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Vendor signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold text-center mb-2">
          Vendor Registration
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
          Register your business on Freshwayz
        </p>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Business Name *</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div>
            <Label>Owner Name *</Label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Password *</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* <div>
            <Label>GST Number *</Label>
            <Input
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
            />
          </div> */}
          <div>
            <Label>GST Number *</Label>
            <Input
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              onBlur={() => validateGstNumber()} // optional: validate on blur
              maxLength={16} // prevents typing more than 16 chars
            />
            {gstError && <p className="text-red-500 text-sm mt-1">{gstError}</p>}
          </div>

          <div className="md:col-span-2">
            <Label>Business Address *</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Website (Optional)</Label>
            <Input
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Bank Details *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label>Bank Name *</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div>
                <Label>Account Number *</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div>
                <Label>IFSC Code *</Label>
                <Input
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  maxLength={11}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="mt-6">
          <Label>Categories *</Label>

          <Input
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="mt-2"
          />

          {/* Selected chips */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCategories.map((id) => {
                const cat = categories.find((c) => c.id === id);
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {cat?.name}
                    <button
                      type="button"
                      onClick={() => toggleCategory(id)}
                      className="ml-1 font-bold hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Dropdown */}
          <div className="border rounded-lg mt-3 max-h-48 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedCategories.includes(cat.id)
                    ? "bg-blue-50 font-medium"
                    : ""
                    }`}
                >
                  {cat.name}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500">
                No categories found
              </p>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <Button
          className="w-full mt-8"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Vendor Account"}
        </Button>

        <p className="text-center text-sm mt-4 text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer font-medium"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { useNavigate } from "react-router-dom";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// type Category = {
//   id: number;
//   name: string;
// };

// export default function VendorSignup() {
//   const navigate = useNavigate();

//   // Categories
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
//   const [categorySearch, setCategorySearch] = useState("");

//   // Form fields
//   const [businessName, setBusinessName] = useState("");
//   const [ownerName, setOwnerName] = useState("");
//   const [email, setEmail] = useState("");
//   const [gstNumber, setGstNumber] = useState("");
//   const [address, setAddress] = useState("");
//   const [website, setWebsite] = useState("");

//   const [loading, setLoading] = useState(false);

//   // Fetch categories
//   useEffect(() => {
//     axios
//       .get("http://localhost:3064/categories/get-categories")
//       .then((res) => setCategories(res.data))
//       .catch(() => toast.error("Failed to load categories"));
//   }, []);

//   // Toggle category
//   const toggleCategory = (id: number) => {
//     setSelectedCategories((prev) =>
//       prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
//     );
//   };

//   // Filter categories
//   const filteredCategories = categories.filter((cat) =>
//     cat.name.toLowerCase().includes(categorySearch.toLowerCase())
//   );

//   // Submit
//   const handleSubmit = async () => {
//     if (
//       !businessName ||
//       !ownerName ||
//       !email ||
//       !gstNumber ||
//       !address ||
//       selectedCategories.length === 0
//     ) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       await axios.post(
//         "http://localhost:3064/vendors/signup",
//         {
//           businessName,
//           ownerName,
//           email,
//           gstNumber,
//           address,
//           website,
//           categories: selectedCategories,
//         }
//       );

//       toast.success("Vendor account created successfully");
//       navigate("/login");
//     } catch (error) {
//       toast.error("Vendor signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-2xl bg-white rounded-xl shadow p-8">
//         <h2 className="text-2xl font-bold text-center mb-2">
//           Vendor Registration
//         </h2>
//         <p className="text-center text-sm text-gray-500 mb-8">
//           Register your business on Freshwayz
//         </p>

//         {/* FORM */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <Label>Business Name *</Label>
//             <Input
//               value={businessName}
//               onChange={(e) => setBusinessName(e.target.value)}
//             />
//           </div>

//           <div>
//             <Label>Owner Name *</Label>
//             <Input
//               value={ownerName}
//               onChange={(e) => setOwnerName(e.target.value)}
//             />
//           </div>

//           <div>
//             <Label>Email *</Label>
//             <Input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div>
//             <Label>GST Number *</Label>
//             <Input
//               value={gstNumber}
//               onChange={(e) => setGstNumber(e.target.value)}
//             />
//           </div>

//           <div className="md:col-span-2">
//             <Label>Business Address *</Label>
//             <Input
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//             />
//           </div>

//           <div className="md:col-span-2">
//             <Label>Website (Optional)</Label>
//             <Input
//               placeholder="https://example.com"
//               value={website}
//               onChange={(e) => setWebsite(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* CATEGORIES */}
//         <div className="mt-6">
//           <Label>Categories *</Label>

//           <Input
//             placeholder="Search categories..."
//             value={categorySearch}
//             onChange={(e) => setCategorySearch(e.target.value)}
//             className="mt-2"
//           />

//           {/* Selected chips */}
//           {selectedCategories.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-3">
//               {selectedCategories.map((id) => {
//                 const cat = categories.find((c) => c.id === id);
//                 return (
//                   <span
//                     key={id}
//                     className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
//                   >
//                     {cat?.name}
//                     <button
//                       type="button"
//                       onClick={() => toggleCategory(id)}
//                       className="ml-1 font-bold hover:text-blue-900"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 );
//               })}
//             </div>
//           )}

//           {/* Dropdown */}
//           <div className="border rounded-lg mt-3 max-h-48 overflow-y-auto">
//             {filteredCategories.length > 0 ? (
//               filteredCategories.map((cat) => (
//                 <button
//                   key={cat.id}
//                   type="button"
//                   onClick={() => toggleCategory(cat.id)}
//                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
//                     selectedCategories.includes(cat.id)
//                       ? "bg-blue-50 font-medium"
//                       : ""
//                   }`}
//                 >
//                   {cat.name}
//                 </button>
//               ))
//             ) : (
//               <p className="px-4 py-3 text-sm text-gray-500">
//                 No categories found
//               </p>
//             )}
//           </div>
//         </div>

//         {/* ACTIONS */}
//         <Button
//           className="w-full mt-8"
//           onClick={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? "Creating account..." : "Create Vendor Account"}
//         </Button>

//         <p className="text-center text-sm mt-4 text-gray-500">
//           Already have an account?{" "}
//           <span
//             onClick={() => navigate("/login")}
//             className="text-blue-600 cursor-pointer font-medium"
//           >
//             Login
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { useNavigate } from "react-router-dom";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// type Category = {
//   id: number;
//   name: string;
// };

// export default function VendorSignup() {
//   const navigate = useNavigate();

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
//   const [businessName, setBusinessName] = useState("");
//   const [ownerName, setOwnerName] = useState("");
//   const [email, setEmail] = useState("");
//   const [gstNumber, setGstNumber] = useState("");
//   const [address, setAddress] = useState("");
//   const [website, setWebsite] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     axios
//       .get("http://localhost:3064/categories/get-categories")
//       .then((res) => setCategories(res.data))
//       .catch(() => toast.error("Failed to load categories"));
//   }, []);

//   const toggleCategory = (id: number) => {
//     setSelectedCategories((prev) =>
//       prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
//     );
//   };

//   const handleSubmit = async () => {
//     if (
//       !businessName ||
//       !ownerName ||
//       !email ||
//       !gstNumber ||
//       !address ||
//       selectedCategories.length === 0
//     ) {
//       toast.error("Please complete all required fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       await axios.post("http://localhost:3064/vendors/signup", {
//         businessName,
//         ownerName,
//         email,
//         gstNumber,
//         address,
//         website,
//         categories: selectedCategories,
//       });

//       toast.success("Vendor account created successfully");
//       navigate("/login");
//     } catch {
//       toast.error("Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-2xl bg-white rounded-xl shadow p-8">
//         <h2 className="text-2xl font-bold text-center mb-2">
//           Vendor Registration
//         </h2>
//         <p className="text-center text-sm text-gray-500 mb-8">
//           Create your Freshwayz vendor profile
//         </p>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <Label>Business Name</Label>
//             <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
//           </div>

//           <div>
//             <Label>Owner Name</Label>
//             <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
//           </div>

//           <div>
//             <Label>Email</Label>
//             <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//           </div>

//           <div>
//             <Label>GST Number</Label>
//             <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
//           </div>

//           <div className="md:col-span-2">
//             <Label>Business Address</Label>
//             <Input value={address} onChange={(e) => setAddress(e.target.value)} />
//           </div>

//           <div className="md:col-span-2">
//             <Label>Website (optional)</Label>
//             <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
//           </div>
//         </div>

//         <div className="mt-6">
//           <Label>Select Categories</Label>
//           <div className="mt-2 flex flex-wrap gap-2 border rounded p-3 max-h-40 overflow-y-auto">
//             {categories.map((cat) => (
//               <button
//                 key={cat.id}
//                 type="button"
//                 onClick={() => toggleCategory(cat.id)}
//                 className={`px-3 py-1 rounded-full text-sm border ${
//                   selectedCategories.includes(cat.id)
//                     ? "bg-blue-600 text-white border-blue-600"
//                     : "bg-gray-100"
//                 }`}
//               >
//                 {cat.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         <Button className="w-full mt-8" onClick={handleSubmit} disabled={loading}>
//           {loading ? "Creating account..." : "Create Vendor Account"}
//         </Button>

//         <p className="text-center text-sm mt-4 text-gray-500">
//           Already registered?{" "}
//           <span
//             onClick={() => navigate("/login")}
//             className="text-blue-600 cursor-pointer font-medium"
//           >
//             Login
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect, ChangeEvent } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { useNavigate } from "react-router-dom";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";

// type Category = {
//   id: number;
//   name: string;
// };

// export default function VendorSignup() {
//   const navigate = useNavigate();

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
//   const [vendorName, setVendorName] = useState("");
//   const [email, setEmail] = useState("");
//   const [gstNumber, setGstNumber] = useState("");
//   const [addresses, setAddresses] = useState([""]);
//   const [website, setWebsite] = useState("");
//   const [marketingFile, setMarketingFile] = useState<File | null>(null);
//   const [discountType, setDiscountType] = useState("");
//   const [discountDuration, setDiscountDuration] = useState<number | "">("");
//   const [bogoOffer, setBogoOffer] = useState(false);
//   const [categorySearch, setCategorySearch] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get<Category[]>(
//         "http://localhost:3064/categories/get-categories"
//       );
//       setCategories(res.data);
//     } catch (err) {
//       toast.error("Failed to load categories");
//     }
//   };

//   const handleCategoryChange = (id: number) => {
//     setSelectedCategories((prev) =>
//       prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
//     );
//   };

//   const addAddress = () => setAddresses([...addresses, ""]);
//   const removeAddress = (index: number) =>
//     setAddresses(addresses.filter((_, i) => i !== index));

//   const handleAddressChange = (index: number, value: string) => {
//     const updated = [...addresses];
//     updated[index] = value;
//     setAddresses(updated);
//   };

//   const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setMarketingFile(e.target.files[0]);
//     }
//   };

//   const validateGst = (gst: string) => {
//     const regex =
//       /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//     return regex.test(gst);
//   };

//   const handleSubmit = async () => {
//     if (!vendorName || !email || !gstNumber || selectedCategories.length === 0) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     if (!validateGst(gstNumber)) {
//       toast.error("Invalid GST number");
//       return;
//     }

//     setLoading(true);

//     const formData = new FormData();
//     formData.append("name", vendorName);
//     formData.append("email", email);
//     formData.append("gstNumber", gstNumber);
//     formData.append("categories", JSON.stringify(selectedCategories));
//     formData.append("addresses", JSON.stringify(addresses));
//     formData.append("website", website);
//     formData.append("discountType", discountType);
//     formData.append("discountDuration", discountDuration.toString());
//     formData.append("bogoOffer", bogoOffer.toString());
//     if (marketingFile) formData.append("marketingFile", marketingFile);

//     try {
//       await axios.post(
//         "http://localhost:3064/vendors/signup",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       toast.success("Signup successful! Please login.");

//       // 👉 Redirect to login page
//       setTimeout(() => navigate("/login"), 1000);
//     } catch (err) {
//       toast.error("Failed to register vendor");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredCategories = categories.filter((cat) =>
//     cat.name.toLowerCase().includes(categorySearch.toLowerCase())
//   );

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
//       <div className="w-full max-w-3xl bg-white border rounded-lg shadow p-8">
//         <h2 className="text-2xl font-bold text-center mb-6">
//           Vendor Signup
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* LEFT */}
//           <div className="space-y-4">
//             <div>
//               <Label>Vendor Name</Label>
//               <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
//             </div>

//             <div>
//               <Label>Email</Label>
//               <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//             </div>

//             <div>
//               <Label>GST Number</Label>
//               <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
//             </div>

//             <div>
//               <Label>Website (Optional)</Label>
//               <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
//             </div>

//             <div>
//               <Label>Marketing Content</Label>
//               <Input type="file" onChange={handleFileUpload} />
//             </div>

//             <div className="flex gap-4">
//               <div className="flex-1">
//                 <Label>Discount Type</Label>
//                 <select
//                   className="border rounded w-full p-2"
//                   value={discountType}
//                   onChange={(e) => setDiscountType(e.target.value)}
//                 >
//                   <option value="">Select</option>
//                   <option value="percentage">Percentage</option>
//                   <option value="flat">Flat</option>
//                 </select>
//               </div>

//               <div className="flex-1">
//                 <Label>Duration (Days)</Label>
//                 <Input
//                   type="number"
//                   value={discountDuration}
//                   onChange={(e) => setDiscountDuration(Number(e.target.value))}
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <Switch checked={bogoOffer} onCheckedChange={setBogoOffer} />
//               <span className="text-sm">Enable BOGO Offer</span>
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div className="space-y-4">
//             <div>
//               <Label>Categories</Label>
//               <Input
//                 placeholder="Search categories..."
//                 value={categorySearch}
//                 onChange={(e) => setCategorySearch(e.target.value)}
//               />
//               <div className="border rounded p-2 mt-2 max-h-40 overflow-y-auto flex flex-wrap gap-2">
//                 {filteredCategories.map((cat) => (
//                   <label key={cat.id} className="flex items-center gap-2 border px-2 py-1 rounded text-sm">
//                     <input
//                       type="checkbox"
//                       checked={selectedCategories.includes(cat.id)}
//                       onChange={() => handleCategoryChange(cat.id)}
//                     />
//                     {cat.name}
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <Label>Addresses</Label>
//               {addresses.map((addr, i) => (
//                 <div key={i} className="flex gap-2 mb-2">
//                   <Input
//                     value={addr}
//                     onChange={(e) => handleAddressChange(i, e.target.value)}
//                     placeholder={`Address ${i + 1}`}
//                   />
//                   {addresses.length > 1 && (
//                     <Button variant="outline" onClick={() => removeAddress(i)}>
//                       Remove
//                     </Button>
//                   )}
//                 </div>
//               ))}
//               <Button variant="outline" onClick={addAddress}>
//                 Add Address
//               </Button>
//             </div>
//           </div>
//         </div>

//         <Button className="w-full mt-8" onClick={handleSubmit} disabled={loading}>
//           {loading ? "Submitting..." : "Signup"}
//         </Button>
//       </div>
//     </div>
//   );
// }
