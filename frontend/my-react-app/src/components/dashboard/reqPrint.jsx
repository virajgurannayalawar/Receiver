import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { ban } from "../../redux/banCheck.js";
import { suspect, unSuspect } from "../../redux/checkSuspect.js"
import { setIsAuthenticated } from "../../redux/authentication.js";






const getBrandIcon = (name) => {

    switch (name) {
        case 'Amazon':
            return <img className="w-5 h-5 object-contain" src="/assets/amazon logo.png" alt="Amazon" />;
        case 'Blinkit':
            return <img className="w-5 h-5 object-contain" src="/assets/blinkit.png" alt="Blinkit" />;
        case 'Swiggy Instamart':
            return <img className="w-5 h-5 object-contain" src="/assets/instamart.png" alt="Instamart" />;
        case 'JioMart':
            return <img className="w-5 h-5 object-contain" src="/assets/JioMart.webp" alt="JioMart" />;
        case 'Zepto':
            return <img className="w-5 h-5 object-contain" src="/assets/zepto.png" alt="Zepto" />;
        case 'Flipkart':
            return <img className="w-5 h-5 object-contain" src="/assets/flifcart.png" alt="Flipkart" />;

        default:
            return (
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 5h4" />
                </svg>
            );
    }
};

function UploadWidget({ setFormData }) {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const authentication = useSelector(state => state.authentication.value)
    const fileInputRef = useRef(null);
    const dispatch = useDispatch();

    const uploadToCloudinary = async (file) => {
        setLoading(true);
        try {

            const sigRes = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}upload-signature`,
                {
                    headers: {

                        Authorization: `Bearer ${authentication.token}`
                    }
                }
            );
            const { signature, timestamp, apiKey } = sigRes.data;


            const data = new FormData();
            data.append("file", file);
            data.append("signature", signature);
            data.append("timestamp", timestamp);
            data.append("api_key", apiKey);


            const res = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, data);


            setFormData(prev => ({ ...prev, screenshot_url: res.data.secure_url }));
        } catch (error) {

            const serverMessage = error.response?.data?.message;

            if (serverMessage == "User is banned" || serverMessage == "Device is banned") {
                dispatch(ban())
                return
            }
            if (serverMessage == "Device is suspected need further verification.please verify face  ") {
                dispatch(suspect())
                return
            }
            if (serverMessage == "session expired") {
                dispatch(setIsAuthenticated(false))
                return
            }
            console.error("Cloudinary upload failed:", error);
            setFileName("");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFileName(selectedFile.name);
            uploadToCloudinary(selectedFile);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xl font-medium text-gray-700">Upload Screenshot</label>
            <div
                onClick={() => !loading && fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${loading ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-400 hover:border-blue-500 hover:bg-gray-50'}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={loading}
                />

                {loading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg text-gray-500">Uploading {fileName}...</span>
                    </div>
                ) : fileName ? (
                    <div className="text-lg text-green-600 font-medium flex flex-col items-center gap-1">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Uploaded successfully!</span>
                    </div>
                ) : (
                    <div className="text-gray-500 flex flex-col items-center gap-1">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xl font-medium">Click to upload delivery receipt/screenshot</span>
                    </div>
                )}
            </div>
        </div>
    );
}


function Form({ onNext, formData, setFormData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(formData.vendor || '');
    const dropdownRef = useRef(null);
    const [file, setFile] = useState(null)

    const rawList = "Amazon,Uber Eats,DoorDash,Zomato,Swiggy,Flipkart,Instacart,Deliveroo,Grubhub,Just Eat,JioMart,Gopuff,Blinkit,BigBasket,Zepto,Swiggy Instamart,Tata Neu,Lalamove,Rapido,Porter,Dunzo,Borzo,BBnow,Ola Dash";
    const items = rawList.split(',');

    const filteredItems = items.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sync input box when external form state updates
    useEffect(() => {
        setSearchTerm(formData.vendor || '');
    }, [formData.vendor]);


    // Handle clicking completely outside the dropdown menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    ;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleDropdownSelect = (value) => {
        setSearchTerm(value);
        setIsOpen(false);
        setFormData((previous) => ({ ...previous, vendor: value }));
    };




    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <div className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Custom Integrated Dropdown Input Group Container */}
                <div ref={dropdownRef} className="relative w-full">
                    <input
                        type="text"
                        name="vendor"
                        required
                        value={searchTerm}
                        onFocus={() => setIsOpen(true)}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            handleInputChange(e);
                        }}
                        placeholder="name of e-commerce or delivery-app"
                        className="bg-white text-2xl font-medium p-2 border w-full focus:outline-none"
                    />

                    {isOpen && (
                        <ul className="absolute mountaineer z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 shadow-lg rounded">


                            {filteredItems.map((item) => (
                                <li
                                    key={item}
                                    onClick={() => handleDropdownSelect(item)}
                                    className="flex items-center gap-3 px-4 py-3 text-xl hover:bg-gray-100 cursor-pointer transition-colors"
                                >
                                    {getBrandIcon(item)}
                                    <span className="font-medium text-gray-800">{item}</span>
                                </li>
                            ))}

                            {filteredItems.length === 0 && (
                                <li className="px-4 py-3 text-xl text-gray-400 italic text-center">
                                    custom e-commerce
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                <input
                    type="text"
                    name="delivery_partner"
                    required
                    value={formData.delivery_partner}
                    onChange={handleInputChange}
                    placeholder="delivery boy name"
                    className="bg-white text-2xl font-medium p-2 border"
                />
                <input
                    type="text"
                    name="item_name"
                    required
                    value={formData.item_name}
                    onChange={handleInputChange}
                    placeholder="name the item"
                    className="bg-white text-2xl font-medium p-2 border"
                />
                <input
                    type="text"
                    name="block"
                    required
                    value={formData.block}
                    onChange={handleInputChange}
                    placeholder="block or hostel name"
                    className="bg-white text-2xl font-medium p-2 border"
                />
                <input
                    type="text"
                    name="floor"
                    required
                    value={formData.floor}
                    onChange={handleInputChange}
                    placeholder="Floor"
                    className="p-2 border text-2xl"
                />
                <input
                    type="text"
                    name="room"
                    required
                    value={formData.room}
                    onChange={handleInputChange}
                    placeholder="Room Number"
                    className="p-2 border text-2xl"
                />

                <UploadWidget setFormData={setFormData} />
                <button
                    type="submit"
                    className="p-2 bg-red-200 hover:bg-red-400 cursor-pointer text-xl"
                >
                    submit request
                </button>
            </form>
        </div>
    );
}

export default function ReqPickup() {
    const [currentStep, setCurrentStep] = useState('FORM');
    const authentication = useSelector(state => state.authentication.value)
    const [formData, setFormData] = useState({
        vendor: "",
        delivery_partner: "",
        item_name: "",
        block: "",
        floor: "",
        room: "",
        screenshot_url: ""
    });

    const deviceFingerPrint = useSelector(state => state.deviceFingerPrint.value);
    const location = useSelector(state => state.location.value);

    const dispatch = useDispatch();

    useEffect(() => {
        if (currentStep === 'SUCCESS') {
            savePickupReq();
        }
    }, [currentStep]);

    const savePickupReq = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/pickup/newRequest`, {
                token: authentication.token,
                vendor: formData.vendor,
                delivery_partner: formData.delivery_partner,
                item_name: formData.item_name,
                block: formData.block,
                floor: formData.floor,
                room: formData.room,
                screenshot_url: formData.screenshot_url,
                security: {
                    device_fingerprint: deviceFingerPrint,
                },
                currentLocation: {
                    type: 'Point',
                    coordinates: [location.longitude,location.latitude]
                },
                role: "client"
            });
        } catch (error) {
            const serverMessage = error.response?.data?.message;

            if (serverMessage === "User is banned" || serverMessage === "Device is banned") {
                dispatch(ban());
                return;
            }
            if (serverMessage === "Device is suspected need further verification.please verify face  ") {
                dispatch(suspect());
                return;
            }
            if (serverMessage === "session expired") {
                dispatch(setIsAuthenticated(false));
                return;
            }
            console.error(error);
        }

        finally {
            console.log("Request completed");
        }


    };
    return (<div >
        {currentStep === 'FORM' && (<Form onNext={() => setCurrentStep('SUCCESS')} setFormData={setFormData} formData={formData} />)}
        {currentStep === 'SUCCESS' && (<div>success </div>)}
    </div>);
}