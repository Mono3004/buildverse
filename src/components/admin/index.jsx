import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminProjects from "./AdminProjects";
import AdminIssues from "./AdminIssues";
import AdminCourses from "./AdminCourses";
import AdminSettings from "./AdminSettings";

export default function AdminModule() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview setActiveTab={setActiveTab} />;
      case "users":
        return <AdminUsers />;
      case "projects":
        return <AdminProjects />;
      case "issues":
        return <AdminIssues />;
      case "courses":
        return <AdminCourses />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </AdminLayout>
  );
}
