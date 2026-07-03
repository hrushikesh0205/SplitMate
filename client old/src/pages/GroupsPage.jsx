import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/common/DashboardLayout.jsx';
import GroupCard from '../components/groups/GroupCard.jsx';
import GroupForm from '../components/groups/GroupForm.jsx';
import { getGroupsApi } from '../api/groupApi.js';
import '../styles/groups-modern.css';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await getGroupsApi();
      setGroups(data);
    } catch (err) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
  };

  return (
    <DashboardLayout>
      <div className='groups-page'>

        <div className='page-header'>
          <div>
            <h1>My Groups</h1>
            <p>Manage your expense groups</p>
          </div>
          <button
            className='btn btn-primary'
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            New Group
          </button>
        </div>

        {loading ? (
          <div className='groups-loading'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='group-card-skeleton' />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className='groups-empty'>
            <span className='groups-empty-icon'>👥</span>
            <h3>No groups yet</h3>
            <p>Create a group to start splitting expenses</p>
            <button
              className='btn btn-primary'
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Create First Group
            </button>
          </div>
        ) : (
          <div className='groups-grid'>
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}

        {showForm && (
          <GroupForm
            onClose={() => setShowForm(false)}
            onGroupCreated={handleGroupCreated}
          />
        )}

      </div>
    </DashboardLayout>
  );
};

export default GroupsPage;