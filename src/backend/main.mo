import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  // Types
  type Project = {
    id : Nat;
    region : Text;
    projectName : Text;
    linkStatus : Text;
    qnrName : Text;
    receivedDate : Text;
    dataStatus : Text;
    quotaRedirectStatus : Text;
    projectLaunchDate : Text;
    dataDelivery : Text;
    createdAt : Int;
  };

  type EditEntry = {
    id : Nat;
    projectId : Nat;
    fieldName : Text;
    oldValue : Text;
    newValue : Text;
    timestamp : Int;
  };

  module EditEntry {
    public func compare(a : EditEntry, b : EditEntry) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  // Persistent data
  var nextProjectId = 1;
  var nextEditId = 1;

  let projects = Map.empty<Nat, Project>();
  let edits = Map.empty<Nat, EditEntry>();

  // Add new project
  public shared ({ caller }) func addProject(project : Project) : async Nat {
    let newProject : Project = {
      project with
      id = nextProjectId;
      createdAt = Time.now();
    };
    projects.add(nextProjectId, newProject);
    nextProjectId += 1;
    newProject.id;
  };

  // Helper to get project
  func getProjectInternal(id : Nat) : Project {
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found ") };
      case (?project) { project };
    };
  };

  // Update project field
  public shared ({ caller = _ }) func updateProjectField(projectId : Nat, fieldName : Text, newValue : Text) : async Bool {
    let project = getProjectInternal(projectId);
    let oldValue = getFieldValue(project, fieldName);

    // Record edit
    let edit : EditEntry = {
      id = nextEditId;
      projectId;
      fieldName;
      oldValue;
      newValue;
      timestamp = Time.now();
    };
    edits.add(nextEditId, edit);
    nextEditId += 1;

    // Update field
    let updatedProject = setFieldValue(project, fieldName, newValue);
    projects.add(projectId, updatedProject);
    true;
  };

  // Get specific field value
  func getFieldValue(project : Project, fieldName : Text) : Text {
    switch (fieldName) {
      case ("region") { project.region };
      case ("projectName") { project.projectName };
      case ("linkStatus") { project.linkStatus };
      case ("qnrName") { project.qnrName };
      case ("receivedDate") { project.receivedDate };
      case ("dataStatus") { project.dataStatus };
      case ("quotaRedirectStatus") { project.quotaRedirectStatus };
      case ("projectLaunchDate") { project.projectLaunchDate };
      case ("dataDelivery") { project.dataDelivery };
      case (_) { Runtime.trap("Field not found ") };
    };
  };

  // Set specific field value
  func setFieldValue(project : Project, fieldName : Text, newValue : Text) : Project {
    switch (fieldName) {
      case ("region") {
        { project with region = newValue };
      };
      case ("projectName") { { project with projectName = newValue } };
      case ("linkStatus") { { project with linkStatus = newValue } };
      case ("qnrName") { { project with qnrName = newValue } };
      case ("receivedDate") { { project with receivedDate = newValue } };
      case ("dataStatus") { { project with dataStatus = newValue } };
      case ("quotaRedirectStatus") { { project with quotaRedirectStatus = newValue } };
      case ("projectLaunchDate") { { project with projectLaunchDate = newValue } };
      case ("dataDelivery") { { project with dataDelivery = newValue } };
      case (_) { Runtime.trap("Field not found ") };
    };
  };

  // Get all projects
  public query ({ caller }) func getAllProjects() : async [Project] {
    projects.values().toArray();
  };

  // Get projects by region
  public query ({ caller }) func getProjectsByRegion(region : Text) : async [Project] {
    projects.values().toArray().filter(
      func(p) {
        Text.equal(p.region, region);
      }
    );
  };

  // Get edit history for specific field
  public query ({ caller }) func getEditHistory(projectId : Nat, fieldName : Text) : async [EditEntry] {
    edits.values().toArray().filter(
      func(e) {
        e.projectId == projectId and Text.equal(e.fieldName, fieldName);
      }
    ).sort();
  };

  // Get full edit history for project
  public query ({ caller }) func getProjectEditHistory(projectId : Nat) : async [EditEntry] {
    edits.values().toArray().filter(
      func(e) {
        e.projectId == projectId;
      }
    ).sort();
  };
};
