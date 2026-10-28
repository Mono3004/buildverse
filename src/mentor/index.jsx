import React, { useState } from "react";
import MentorLayout from "./MentorLayout";
import MentorOverview from "./MentorOverview";
import MentorMentees from "./MentorMentees";
import MentorReviews from "./MentorReviews";
import MentorCourses from "./MentorCourses";
import MentorProfile from "./MentorProfile";

export default function MentorModule() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <MentorOverview setActiveTab={setActiveTab} />;
      case "mentees":
        return <MentorMentees />;
      case "reviews":
        return <MentorReviews />;
      case "courses":
        return <MentorCourses />;
      case "profile":
        return <MentorProfile />;
      default:
        return <MentorOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <MentorLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </MentorLayout>
  );
}
