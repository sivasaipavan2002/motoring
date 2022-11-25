import { Api } from "../../../dist/models";
import * as t from "../../../dist/api/temperature/types";
import * as v from "../../../dist/validation";
import { db } from "../../db";
const AsyncFunction = (async function () {}).constructor;

export class MonitoringService {
	private readonly collectionName: string;

	constructor() {
		this.collectionName = "Temperature_Patients";
		this.getALL = this.getALL.bind(this);
		this.post = this.post.bind(this);
		this.delete = this.delete.bind(this);
		this.get = this.get.bind(this);
		this.put = this.put.bind(this);
	}

	/* *
	 ! Todo: Implement pagination for this service
	*/
	async getALL(
		limit: number | null | undefined,
		direction: Api.DirectionParamEnum | undefined,
		sortByField: string | null | undefined
	): Promise<t.GetMonitoringTemperatureResponse> {
		try {
			const MonitoringQuerySnap = await db.collection(`${this.collectionName}`).get();
			const MonitoringTem: Api.MonitoringDto2[] = MonitoringQuerySnap.docs
				.map((doc) => doc.data())
				.map((json) => v.modelApiMonitoringDto2FromJson("Temperature_PATIENTS", json));
			return {
				status: 200,
				body: {
					items: MonitoringTem,
					totalCount: MonitoringTem.length,
				},
			};
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async get(id: string): Promise<t.GetMonitoringTemperaturegetResponse> {
		try {
			const MontoringDocSnap = await db.doc(`${this.collectionName}/${id}`).get();
			if (!MontoringDocSnap.exists) {
				throw new Error("no-Temperature_patient-found");
			}
			const Monitoring = v.modelApiMonitoringDto2FromJson("Temperature_patient", MontoringDocSnap.data());
			return {
				status: 200,
				body: Monitoring,
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("no-Temperature_patient-found")) {
				return {
					status: 404,
					body: {
						message: "No Temperature_Patient found with given id",
					},
				};
			}
			throw error;
		}
	}


	async post(request: Api.MonitoringDto2 | undefined): Promise<t.PostMonitoringTemperatureResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.id) {
				throw new Error("no-uId-found");
			}

			const Ref = db.collection(`${this.collectionName}`).doc(request.id);
			try {
				await this._checkUserExists(request.id);
			} catch (error: any) {
				if (error.toString().match("no-Temperature_patient-found")) {
					await Ref.set({
						...request,
						isExist: true,
						id: Ref.id,
						createdAt: new Date().toISOString(),
					});
					return {
						status: 201,
						body: request,
					};
				}
			}
			throw new Error("Temperature_patient-already-exists");
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No id found in request",
					},
				};
			}

			if (error.toString().match("Temperature_patient-already-exists")) {
				return {
					status: 422,
					body: {
						message: "Temperature_Patient already exists with given uid",
					},
				};
			}
			throw error;
		}
	}

	async put(request: Api.MonitoringDto2  | undefined): Promise<t.PutMonitoringTemperatureResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.id) {
				throw new Error("no-uId-found");
			}

			const Ref = db.collection(`${this.collectionName}`).doc(request.id);

			// checking whether BP_patients exists or not
			const Res = await this._checkUserExists(request.id);
			await Ref.update({
				...request,
				updatedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					...Res,
					...request,
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No id found in request",
					},
				};
			}

			throw error;
		}
	}

	async delete(id: string): Promise<t.DeleteMonitoringTemperatureResponse> {
		try {
			await this._checkUserExists(id);
			const Ref = db.collection(`${this.collectionName}`).doc(id);
			await Ref.update({
				isExist: false,
				deletedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					message: "Temperature_Patient deleted successfully",
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error?.response?.status === 404) {
				return {
					status: 404,
					body: {
						message: "Temperature_Patient already deleted or no Temperature_patient found",
					},
				};
			}
			throw error;
		}
	}

	private async _checkUserExists(id: string) {
		const response = await this.get(id);
		if (response.status === 404) {
			throw new Error("no-Temperature_patient-found");
		}
		return response.body;
	}
}
