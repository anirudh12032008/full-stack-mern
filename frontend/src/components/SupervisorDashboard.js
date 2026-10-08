import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Api from "../api/Api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function SupervisorDashboard() {

  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [priority, setPriority] = useState("Medium");
  const [showDropdown, setShowDropdown] = useState(false);
  const [myRequests, setMyRequests] = useState([]);


  const supervisorId = localStorage.getItem("id");


  const getLocations = useCallback(async () => {
    try {
      const res = await axios.get(
        `${Api.get_Supervisor_Locations}/${supervisorId}`
      );
      setLocations(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [supervisorId]);



  const getMyRequests = useCallback(async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${Api.get_My_Emg_Req}/${supervisorId}`
      );


      const data = res.data?.data || res.data || [];


      const filtered = data.filter((req) => {

        const createdBy =
          req.requestedBy?._id || req.requestedBy;

        return createdBy?.toString() === supervisorId?.toString();

      });




      setMyRequests(filtered);


    }
    catch (err) {

      console.log(err);

      setMyRequests([]);

    }
    finally {

      setLoading(false);

    }


  }, [supervisorId]);


  // ================= CREATE REQUEST =================
  const handleSubmit = async () => {
    try {

      if (!selectedLocation) {
        toast.warning("Please select a location");
        return;
      }

      const res = await axios.post(
        Api.create_Emg_Req,
        {
          requestedBy: supervisorId,
          location: selectedLocation._id,
          priority,
        }
      );

      toast.success(
        res.data?.message || "Request Created Successfully"
      );

      // getAllRequests();
      getMyRequests();

      setSelectedLocation(null);
      setSearch("");
      setPriority("Medium");
      setShowDropdown(false);

    } catch (err) {

      console.log(
        "STATUS =>",
        err.response?.status
      );

      console.log(
        "DATA =>",
        err.response?.data
      );

      console.log(
        "FULL ERROR =>",
        err
      );

      toast.error(
        err.response?.data?.message || "Request Failed"
      );
    }
  };


  const filteredRequests = myRequests.filter((req) => {

    if (statusFilter === "All") {
      return req.status !== "Completed";
    }


    if (statusFilter === "Overdue") {
      return (
        req.isOverdue &&
        req.status !== "Completed"
      );
    }


    if (statusFilter === "Scheduled") {
      return (
        req.status === "Scheduled" &&
        req.scheduledDate &&
        !req.isOverdue
      );
    }


    return req.status === statusFilter;

  });
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    // Overdue sabse upar
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;

    const getDateTime = (req) => {
      // Agar schedule hai to schedule datetime use karo
      if (req.scheduledDate && req.scheduledTime) {
        return new Date(
          `${req.scheduledDate}T${req.scheduledTime}`
        ).getTime();
      }

      // Nahi hai to createdAt use karo
      return new Date(req.createdAt).getTime();
    };

    return getDateTime(a) - getDateTime(b);
  });



  const overdueRequests = sortedRequests.filter(
    (req) =>
      req.isOverdue &&
      req.status !== "Completed"
  );

  const activeRequests = sortedRequests.filter(
    (req) =>
      !req.isOverdue ||
      req.status === "Completed"
  );


  useEffect(() => {
    getLocations();
    getMyRequests();
  }, [getLocations, getMyRequests]);
  return (

    <div className="min-h-screen bg-[#4CBB17]/20">

      {/* Header */}
      <div className="mb-6 bg-[#4CBB17]/40 px-4 py-5 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Logo + Title */}
          <div className="flex items-center gap-3">

            <img
              src="garbageVehicle.jpeg"
              alt="CleanTrack Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
            />


            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-green-900 ">
                CleanTrack
              </h1>

              <p className="text-gray-900 text-sm sm:text-base">
                Smart Waste Management Control Center
              </p>

            </div>

          </div>



          {/* Caretaker Button */}
          <Link
            to="/caretaker-requests"
            className="bg-green-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl-bold shadow-lg text-center text-sm sm:text-base"
          >
            👤 View Caretaker Requests
          </Link>


        </div>

      </div>

      <div className="bg-green-700 text-white py-4 shadow-lg">
        <h1 className="text-center text-xl sm:text-2xl lg:text-3xl font-bold">          Supervisor DashBoard
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 lg:p-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-1 px-2 lg:px-6">
          {/* Create Request */}
          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-3xl font-bold text-green-900 mb-6">
              Create Pickup Request
            </h2>

            {/* Location */}
            <div className="mb-5">
              <label className="font-semibold block mb-2">
                Location
              </label>

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Search pickup address..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
              //                 onFocus={() => setShowDropdown(true)}
              // onBlur={() => {
              //   setTimeout(() => {
              //     setShowDropdown(false);
              //   }, 200);
              // }}
              />

              {showDropdown && (
                <div className="border rounded-xl mt-2 max-h-40 overflow-y-auto">
                  {locations
                    .filter((l) =>
                      l.locationName
                        ?.toLowerCase()
                        .includes(search.toLowerCase())
                    )
                    .map((loc) => (
                      <div
                        key={loc._id}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setSearch(loc.locationName);
                          setShowDropdown(false);
                        }}
                        className="p-3 hover:bg-gray-100 cursor-pointer"
                      >
                        {loc.locationName}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="mb-6">
              <label className="font-semibold block mb-3">
                Priority Level
              </label>

              <div className="grid grid-cols-3 gap-2">                {["Low", "Medium", "High"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 text-sm lg:text-base rounded-full font-semibold ${priority === p
                    ? "bg-green-800 text-white"
                    : "border"
                    }`}
                >
                  {p}
                </button>
              ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-800 text-white py-4 rounded-xl text-lg font-bold"
            >
              Create Request
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 px-2 lg:px-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold">
                  Active Requests
                </h2>

                <p className="text-gray-500 text-sm">
                  Pickup Scheduling & Monitoring
                </p>
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full md:w-60 border border-gray-300 rounded-xl px-4 py-2"  >
                <option value="All">
                  All Active
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Scheduled">
                  Scheduled
                </option>

                {/* <option value="Arrived">
      Arrived
    </option> */}

                <option value="Overdue">
                  Overdue
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>

            </div>
            {
              loading ? (

                <div className="flex flex-col items-center justify-center py-16">




                  <h3 className="text-xl font-bold text-green-800 mt-4">
                    Loading Requests...
                  </h3>


                </div>


              )

                :

                sortedRequests.length === 0 ? (


                  <div className="flex flex-col items-center justify-center py-16">

                    <div className="text-6xl mb-4">
                      🧹
                    </div>


                    <h3 className="text-2xl font-bold text-gray-500">
                      No Requests Found
                    </h3>


                  </div>


                )

                  :

                  (
                    <div className="space-y-8">

                      {/* OVERDUE REQUESTS */}
                      {overdueRequests.length > 0 && (
                        <div>
                          <h2 className="text-2xl font-bold text-red-600 mb-4">
                            Overdue Requests ({overdueRequests.length})
                          </h2>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">          {overdueRequests.map((req) => (
                            <div
                              key={req._id}
                              className="border-2 border-red-500 bg-red-50 rounded-2xl p-5 hover:shadow-lg transition"
                            >
                              {/* <p className="text-xs text-gray-500">
                REQUEST #{req._id.slice(-4)}
              </p> */}

                              <h3 className="text-xl font-semibold text-red-700">
                                📍 {req.location?.locationName}
                              </h3>

                              <div className="flex justify-between items-center mt-4">
                                <span>
                                  Priority: {req.priority}
                                </span>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={
                                      req.status === "Completed"
                                        ? "bg-green-500 text-white px-4 py-1 rounded-full"
                                        : req.status === "Scheduled"
                                          ? "bg-sky-500 text-white px-4 py-1 rounded-full"
                                          : req.status === "Pending"
                                            ? "bg-yellow-500 text-black px-4 py-1 rounded-full"
                                            : req.status === "Arrived"
                                              ? "bg-orange-500 text-white px-4 py-1 rounded-full"
                                              : "bg-gray-500 text-white px-4 py-1 rounded-full"
                                    }
                                  >
                                    {req.status}
                                  </span>

                                  {req.status !== "Completed" && (
                                    <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                      OVERDUE
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-gray-500 mt-4">
                                Created:{" "}
                                {new Date(req.createdAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            </div>
                          ))}
                          </div>
                        </div>
                      )}

                      {/* ACTIVE REQUESTS */}
                      <div>
                        {/* <h2 className="text-2xl font-bold text-green-700 mb-4">
        Active Requests ({activeRequests.length})
      </h2> */}

                        <div className="grid md:grid-cols-2 gap-4">
                          {activeRequests.map((req) => (
                            <div
                              key={req._id}
                              className="border rounded-2xl p-5 hover:shadow-lg transition"
                            >
                              {/* <p className="text-xs text-gray-500">
              REQUEST #{req._id.slice(-4)}
            </p> */}

                              <h3 className="text-xl font-semibold text-green-800">
                                📍 {req.location?.locationName}
                              </h3>

                              <div className="flex justify-between items-center mt-4">
                                <span>
                                  Priority: {req.priority}
                                </span>

                                <span
                                  className={
                                    req.status === "Completed"
                                      ? "bg-green-500 text-white px-4 py-1 rounded-full"
                                      : req.status === "Scheduled"
                                        ? "bg-sky-500 text-white px-4 py-1 rounded-full"
                                        : req.status === "Pending"
                                          ? "bg-yellow-500 text-black px-4 py-1 rounded-full"
                                          : req.status === "Arrived"
                                            ? "bg-orange-500 text-white px-4 py-1 rounded-full"
                                            : "bg-gray-500 text-white px-4 py-1 rounded-full"
                                  }
                                >
                                  {req.status}
                                </span>
                              </div>

                              <p className="text-sm text-gray-500 mt-4">
                                Created:{" "}
                                {new Date(req.createdAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>

                              {req.scheduledDate && (
                                <p className="text-sm text-sky-700 mt-2 font-medium">
                                  Scheduled:{" "}
                                  {new Date(req.scheduledDate).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                  {" | "}
                                  {req.scheduledTime}
                                </p>
                              )}

                              {req.arrivedAt && (
                                <p className="text-sm text-yellow-700 mt-2 font-medium">
                                  Arrived:{" "}
                                  {new Date(req.arrivedAt).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              )}

                              {req.completedAt && (
                                <p className="text-sm text-green-700 mt-2 font-medium">
                                  Completed:{" "}
                                  {new Date(req.completedAt).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
          </div>
        </div>

      </div>
    </div>);
}