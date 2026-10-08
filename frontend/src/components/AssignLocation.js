import React, { useEffect, useState } from "react";
import axios from "axios";
import Api from "../api/Api";
import { toast } from "react-toastify";

function AssignLocation() {
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [selectedZone, setSelectedZone] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        Api.get_All_User
      );

      const onlySupervisors =
        res.data.filter(
          (u) => u.role === "supervisor"
        );

      setSupervisors(onlySupervisors);

    } catch (err) {
      console.log(err);
    }
  };

  const assignZone = async () => {
    try {
      if (!selectedSupervisor) {
        return toast.warning("Please select a supervisor");
      }

      if (!selectedZone) {
        return toast.warning("Please select a zone");
      }

      const res = await axios.put(Api.assign_Zone, {
        supervisorId: selectedSupervisor,
        zone: selectedZone,
      });


      toast.success(
        `Zone assigned successfully. ${res.data.locationsCount} locations assigned.`
      );

      setSelectedSupervisor("");
      setSelectedZone("");
    } catch (err) {
      console.log(err.response?.data || err);

      toast.error(
        err.response?.data?.message || "Assignment failed"
      );
    }
  };

  return (
    <div className="bg-[#4CBB17]/20">

      <div className="min-h-screen bg-green-50 ">
        {/* Header */}
        <div className="bg-[#4CBB17]/40 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
            <img
              src="garbageVehicle.jpeg"
              alt="CleanTrack Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
            />

            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-green-900">
                CleanTrack
              </h1>

              <p className="text-sm sm:text-base text-gray-900 mt-1">
                Smart Waste Management Control Center
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 m-6">

          <h2 className="text-2xl font-bold text-green-900 mb-5">
            Assign Zone To Supervisor
          </h2>

          {/* Supervisor Dropdown */}

          <select
            className="border p-3 rounded w-full mb-4"
            value={selectedSupervisor}
            onChange={(e) =>
              setSelectedSupervisor(
                e.target.value
              )
            }
          >
            <option value="">
              Select Supervisor
            </option>

            {supervisors.map((sup) => (
              <option
                key={sup._id}
                value={sup._id}
              >
                {sup.name}
              </option>
            ))}
          </select>

          {/* Zone Dropdown */}

          <select
            className="border p-3 rounded w-full mb-4"
            value={selectedZone}
            onChange={(e) =>
              setSelectedZone(
                e.target.value
              )
            }
          >
            <option value="">
              Select Zone
            </option>

            <option value="Hostel Zone 1">
              Hostel Zone 1
            </option>

            <option value="Hostel Zone 2">
              Hostel Zone 2
            </option>

            <option value="Academic Zone">
              Academic Zone
            </option>

            <option value="Colony Zone">
              Colony Zone
            </option>
          </select>

          <button
            onClick={assignZone}
            className="bg-green-800 hover:bg-green-900 text-white px-5 py-3 rounded w-full"
          >
            Assign Zone
          </button>

        </div>
      </div>
    </div>
  );
}

export default AssignLocation;