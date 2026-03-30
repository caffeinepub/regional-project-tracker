import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {

  // ─── Legacy type (no linkComments) ────────────────────────────────────────
  // Kept so Motoko can deserialise the existing stable `projects` Map on upgrade.
  type OldProject = {
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

  // ─── Current types ────────────────────────────────────────────────────────
  type Project = {
    id : Nat;
    region : Text;
    projectName : Text;
    linkStatus : Text;
    linkComments : Text;
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

  // ─── Region mapping ───────────────────────────────────────────────────────
  func regionBelongsToTab(projectRegion : Text, tab : Text) : Bool {
    switch (tab) {
      case ("Healthcare") {
        Text.equal(projectRegion, "Healthcare") or Text.equal(projectRegion, "Noram");
      };
      case ("Middle East") {
        Text.equal(projectRegion, "Middle East") or Text.equal(projectRegion, "COE");
      };
      case ("Europe") {
        Text.equal(projectRegion, "Europe") or Text.equal(projectRegion, "Mckinsey");
      };
      case ("Insightz") { Text.equal(projectRegion, "Insightz") };
      case ("Internal (SG)") { Text.equal(projectRegion, "Internal (SG)") };
      case (_) { Text.equal(projectRegion, tab) };
    };
  };

  // ─── Stable storage ───────────────────────────────────────────────────────

  // `projects` uses OldProject so Motoko can deserialise the existing stable Map.
  // After the first upgrade this Map is empty; all live data moves to `_projects`.
  let projects = Map.empty<Nat, OldProject>();

  // New stable Map for the updated Project type (with linkComments).
  let _projects = Map.empty<Nat, Project>();

  // edits type is unchanged – stable Map continues to work as before.
  let edits = Map.empty<Nat, EditEntry>();

  // Stable counters and migration flag.
  stable var nextProjectId = 1;
  stable var nextEditId = 1;
  stable var _migrationDone : Bool = false;

  // ─── One-time migration ───────────────────────────────────────────────────
  system func postupgrade() {
    if (not _migrationDone) {
      var maxId : Nat = 0;
      for ((_, old) in projects.entries()) {
        let p : Project = {
          id = old.id;
          region = old.region;
          projectName = old.projectName;
          linkStatus = old.linkStatus;
          linkComments = "";
          qnrName = old.qnrName;
          receivedDate = old.receivedDate;
          dataStatus = old.dataStatus;
          quotaRedirectStatus = old.quotaRedirectStatus;
          projectLaunchDate = old.projectLaunchDate;
          dataDelivery = old.dataDelivery;
          createdAt = old.createdAt;
        };
        _projects.add(p.id, p);
        if (p.id > maxId) maxId := p.id;
      };
      if (maxId > 0) nextProjectId := maxId + 1;

      var maxEditId : Nat = 0;
      for ((id, _) in edits.entries()) {
        if (id > maxEditId) maxEditId := id;
      };
      if (maxEditId > 0) nextEditId := maxEditId + 1;

      _migrationDone := true;
    };
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  func getProjectInternal(id : Nat) : Project {
    switch (_projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?p) { p };
    };
  };

  func getFieldValue(project : Project, fieldName : Text) : Text {
    switch (fieldName) {
      case ("region") { project.region };
      case ("projectName") { project.projectName };
      case ("linkStatus") { project.linkStatus };
      case ("linkComments") { project.linkComments };
      case ("qnrName") { project.qnrName };
      case ("receivedDate") { project.receivedDate };
      case ("dataStatus") { project.dataStatus };
      case ("quotaRedirectStatus") { project.quotaRedirectStatus };
      case ("projectLaunchDate") { project.projectLaunchDate };
      case ("dataDelivery") { project.dataDelivery };
      case (_) { Runtime.trap("Field not found") };
    };
  };

  func setFieldValue(project : Project, fieldName : Text, newValue : Text) : Project {
    switch (fieldName) {
      case ("region") { { project with region = newValue } };
      case ("projectName") { { project with projectName = newValue } };
      case ("linkStatus") { { project with linkStatus = newValue } };
      case ("linkComments") { { project with linkComments = newValue } };
      case ("qnrName") { { project with qnrName = newValue } };
      case ("receivedDate") { { project with receivedDate = newValue } };
      case ("dataStatus") { { project with dataStatus = newValue } };
      case ("quotaRedirectStatus") { { project with quotaRedirectStatus = newValue } };
      case ("projectLaunchDate") { { project with projectLaunchDate = newValue } };
      case ("dataDelivery") { { project with dataDelivery = newValue } };
      case (_) { Runtime.trap("Field not found") };
    };
  };

  // ─── Public API ───────────────────────────────────────────────────────────

  public shared ({ caller }) func addProject(project : Project) : async Nat {
    let newProject : Project = { project with id = nextProjectId; createdAt = Time.now() };
    _projects.add(nextProjectId, newProject);
    nextProjectId += 1;
    newProject.id;
  };

  public shared ({ caller = _ }) func deleteProject(projectId : Nat) : async Bool {
    switch (_projects.get(projectId)) {
      case (null) { false };
      case (?_) { ignore _projects.remove(projectId); true };
    };
  };

  public shared ({ caller = _ }) func updateProjectField(projectId : Nat, fieldName : Text, newValue : Text) : async Bool {
    let project = getProjectInternal(projectId);
    let oldValue = getFieldValue(project, fieldName);
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
    let updated = setFieldValue(project, fieldName, newValue);
    _projects.add(projectId, updated);
    true;
  };

  public query ({ caller }) func getAllProjects() : async [Project] {
    _projects.values().toArray();
  };

  public query ({ caller }) func getProjectsByRegion(region : Text) : async [Project] {
    _projects.values().toArray().filter(
      func(p) { regionBelongsToTab(p.region, region) }
    );
  };

  public query ({ caller }) func getEditHistory(projectId : Nat, fieldName : Text) : async [EditEntry] {
    edits.values().toArray().filter(
      func(e) { e.projectId == projectId and Text.equal(e.fieldName, fieldName) }
    ).sort();
  };

  public query ({ caller }) func getProjectEditHistory(projectId : Nat) : async [EditEntry] {
    edits.values().toArray().filter(
      func(e) { e.projectId == projectId }
    ).sort();
  };
};
