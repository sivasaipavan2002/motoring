import { MonitoringService } from "./impl";
import * as t from "../../../dist/api/spo2/types";

const service = new MonitoringService();

export const Monitoring_Spo2ServiceImpl: t.Spo2Api= {
	getMonitoringSpo2: service.getALL,
    getMonitoringSpo2get:service.get,
	postMonitoringSpo2: service.post,
	putMonitoringSpo2: service.put,
	deleteMonitoringSpo2: service.delete,
};