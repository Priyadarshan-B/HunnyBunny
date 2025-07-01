import { DatePicker, message, Typography, Card, Button } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import requestApi from "../../components/utils/axios";
import AttendanceTable from "../../components/table/AttendanceTable";

const { Title } = Typography;

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();

  const fetchData = async (date) => {
    try {
      const dateStr = date.format("YYYY-MM-DD");
      const res = await requestApi("GET", `/attendance/daily?date=${dateStr}`);
      setAttendanceData(res.data);
    } catch (err) {
      message.error("Failed to fetch attendance");
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  return (
    <div className="p-4">
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Title level={3}>Daily Staff Attendance</Title>
            <Button type="primary" onClick={() => navigate("/attendance-form")}>
              Mark Attendance
            </Button>
          </div>

          <DatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            style={{ width: 200 }}
          />

          <AttendanceTable data={attendanceData} />
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
