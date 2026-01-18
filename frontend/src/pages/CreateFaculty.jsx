import React, { useState } from "react";
import { apiFetch } from "../api/api";

const CreateFaculty = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiFetch("/admin/faculty", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("STATUS:", res.status, data);

      if (!res.ok) return alert(data.message || "Failed");

      alert("Faculty Created ✅");
      setForm({ name: "", email: "", password: "", department: "" });
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="border p-2 w-full"
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="border p-2 w-full"
      />
      <input
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="border p-2 w-full"
      />
      <input
        name="department"
        value={form.department}
        onChange={handleChange}
        placeholder="Department"
        className="border p-2 w-full"
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Create
      </button>
    </form>
  );
};

export default CreateFaculty;
