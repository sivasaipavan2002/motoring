import { MonitoringService } from "./impl";
import * as t from "../../../dist/api/temperature/types";

const service = new MonitoringService();

export const Monitoring_TemperatureServiceImpl: t. TemperatureApi= {
	getMonitoringTemperature: service.getALL,
    getMonitoringTemperatureget:service.get,
	postMonitoringTemperature: service.post,
	putMonitoringTemperature: service.put,
	deleteMonitoringTemperature: service.delete,
};