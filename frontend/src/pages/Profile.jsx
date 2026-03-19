import { useState, useEffect } from "react";
import API from "../api/axios";

export default function Profile() {

  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState({});
  const [originalUser, setOriginalUser] = useState({});
  const [selectedRiskProfile, setSelectedRiskProfile] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://127.0.0.1:8000";

  const formatDate = (date) =>
    date ? date.split("T")[0] : "";

  const riskProfiles = [
    { value: "conservative", label: "Conservative" },
    { value: "moderate", label: "Moderate" },
    { value: "aggressive", label: "Aggressive" }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile/");

      const formatted = {
        ...res.data,
        date_of_birth: formatDate(res.data?.date_of_birth)
      };

      setUser(formatted);
      setOriginalUser(formatted);
      setSelectedRiskProfile(res.data?.risk_profile || "");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isChanged = () => {
    return (
      user?.name !== originalUser?.name ||
      user?.phone !== originalUser?.phone ||
      user?.address !== originalUser?.address ||
      user?.date_of_birth !== originalUser?.date_of_birth
    );
  };

  const updateProfile = async () => {
    try {
      await API.put("/profile/", user);
      setOriginalUser(user);
      alert("Profile updated successfully");
    } catch {
      alert("Update failed");
    }
  };

  const updateRisk = async () => {
    try {
      await API.put("/profile/", {
        risk_profile: selectedRiskProfile
      });

      const updated = { ...user, risk_profile: selectedRiskProfile };
      setUser(updated);
      setOriginalUser(updated);

      alert("Risk profile updated");

    } catch {
      alert("Update failed");
    }
  };

  const uploadPhoto = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/profile/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUser({
        ...user,
        profile_picture: res.data.profile_picture
      });

      setFile(null);
      alert("Photo uploaded successfully");

    } catch {
      alert("Upload failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-500">Manage your account settings</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* PROFILE CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center space-y-4">

            {user?.profile_picture ? (
              <img
                src={`${BASE_URL}/${user.profile_picture}`}
                alt="profile"
                className="w-28 h-28 rounded-full mx-auto object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-3xl font-bold text-emerald-600">
                {user?.name
                  ? user.name.split(" ").map(n => n[0]).join("")
                  : "U"}
              </div>
            )}

            {!user?.profile_picture && (
              <div className="space-y-2">
                <input
                  type="file"
                  id="fileUpload"
                  onChange={(e)=>setFile(e.target.files[0])}
                  className="hidden"
                />

                <label
                  htmlFor="fileUpload"
                  className="text-sm text-emerald-600 cursor-pointer"
                >
                  Choose Photo
                </label>

                {file && (
                  <button
                    onClick={uploadPhoto}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-xl"
                  >
                    Upload Photo
                  </button>
                )}
              </div>
            )}

            <h2 className="text-lg font-semibold">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>

            <div className="space-y-3 mt-3">

              <div className="bg-gray-100 rounded-xl px-4 py-2 flex justify-between">
                <span className="text-sm text-gray-500">KYC</span>
                <span className={`text-sm font-medium ${
                  user?.kyc_status === "verified"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}>
                  {user?.kyc_status || "pending"}
                </span>
              </div>

              <div className="bg-gray-100 rounded-xl px-4 py-2 flex justify-between">
                <span className="text-sm text-gray-500">Risk</span>
                <span className="text-sm capitalize font-medium">
                  {user?.risk_profile}
                </span>
              </div>

            </div>

          </div>

          {/* SETTINGS */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={()=>setActiveTab("personal")}
                className={`flex-1 py-2 rounded-full ${
                  activeTab==="personal" ? "bg-white shadow-sm" : "text-gray-400"
                }`}
              >
                Personal
              </button>

              <button
                onClick={()=>setActiveTab("risk")}
                className={`flex-1 py-2 rounded-full ${
                  activeTab==="risk" ? "bg-white shadow-sm" : "text-gray-400"
                }`}
              >
                Risk
              </button>
            </div>

            {/* PERSONAL TAB */}
            {activeTab === "personal" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">

                <input
                  placeholder="Name"
                  value={user?.name || ""}
                  onChange={(e)=>setUser({...user,name:e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-100"
                />

                <input
                  value={user?.email || ""}
                  disabled
                  className="w-full p-3 rounded-xl bg-gray-100"
                />

                <input
                  placeholder="Phone"
                  value={user?.phone || ""}
                  onChange={(e)=>setUser({...user,phone:e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-100"
                />

                <input
                  placeholder="Address"
                  value={user?.address || ""}
                  onChange={(e)=>setUser({...user,address:e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-100"
                />

                <input
                  type="date"
                  value={user?.date_of_birth || ""}
                  onChange={(e)=>setUser({...user,date_of_birth:e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-100"
                />

                {isChanged() && (
                  <button
                    onClick={updateProfile}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl"
                  >
                    Save Changes
                  </button>
                )}

              </div>
            )}

            {/* RISK TAB */}
            {activeTab === "risk" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">

                {riskProfiles.map(p => (
                  <div
                    key={p.value}
                    onClick={()=>setSelectedRiskProfile(p.value)}
                    className={`p-4 rounded-xl cursor-pointer ${
                      selectedRiskProfile===p.value
                        ? "bg-emerald-50"
                        : "bg-gray-100"
                    }`}
                  >
                    {p.label}
                  </div>
                ))}

                {selectedRiskProfile !== originalUser?.risk_profile && (
                  <button
                    onClick={updateRisk}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl"
                  >
                    Update Risk Profile
                  </button>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}