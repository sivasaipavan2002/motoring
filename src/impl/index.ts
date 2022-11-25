import { TemperatureApi } from "../../dist/api/temperature/types";
import { Spo2Api } from "../../dist/api/spo2/types";


import { ApiImplementation } from "../../dist/types";

import { Monitoring_TemperatureServiceImpl } from "./Temperature";
import { Monitoring_Spo2ServiceImpl } from "./Spo2";


export class ServiceImplementation implements ApiImplementation {

	spo2: Spo2Api = Monitoring_Spo2ServiceImpl;

	temperature: TemperatureApi = Monitoring_TemperatureServiceImpl;
}