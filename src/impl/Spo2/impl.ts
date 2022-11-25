import { Api } from "../../../dist/models";
import * as t from "../../../dist/api/spo2/types";
import * as v from "../../../dist/validation";
import { db } from "../../db";
const AsyncFunction = (async function () {}).constructor;

export class MonitoringService {
	private readonly collectionName: string;

	constructor() {
		this.collectionName = "Spo2_Patients";
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
	): Promise<t.GetMonitoringSpo2Response> {
		try {
			const MonitoringQuerySnap = await db.collection(`${this.collectionName}`).get();
			const Monitoring : Api.MonitoringDto6[] = MonitoringQuerySnap.docs
				.map((doc) => doc.data())
				.map((json) => v.modelApiMonitoringDto6FromJson("Spo2_PATIENTS", json));
			return {
				status: 200,
				body: {
					items: Monitoring,
					totalCount: Monitoring.length,
				},
			};
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async get(id: string): Promise<t.GetMonitoringSpo2getResponse> {
		try {
			const MontoringDocSnap = await db.doc(`${this.collectionName}/${id}`).get();
			if (!MontoringDocSnap.exists) {
				throw new Error("no-Spo2_patient-found");
			}
			const Monitoring = v.modelApiMonitoringDto6FromJson("Spo2_patient", MontoringDocSnap.data());
			return {
				status: 200,
				body: Monitoring,
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("no-Spo2_patient-found")) {
				return {
					status: 404,
					body: {
						message: "No Spo2_Patient found with given id",
					},
				};
			}
			throw error;
		}
	}


	async post(request: Api.MonitoringDto6 | undefined): Promise<t.PostMonitoringSpo2Response> {
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
				if (error.toString().match("no-Spo2_patient-found")) {
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
			throw new Error("Spo2_patient-already-exists");
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

			if (error.toString().match("Spo2_patient-already-exists")) {
				return {
					status: 422,
					body: {
						message: "Spo2_Patient already exists with given uid",
					},
				};
			}
			throw error;
		}
	}

	async put(request: Api.MonitoringDto6  | undefined): Promise<t.PutMonitoringSpo2Response> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.id) {
				throw new Error("no-uId-found");
			}

			const Ref = db.collection(`${this.collectionName}`).doc(request.id);

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

	async delete(id: string): Promise<t. DeleteMonitoringSpo2Response> {
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
					message: "Spo2_Patient deleted successfully",
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error?.response?.status === 404) {
				return {
					status: 404,
					body: {
						message: "Spo2_Patient already deleted or no Spo2_patient found",
					},
				};
			}
			throw error;
		}
	}

	private async _checkUserExists(id: string) {
		const response = await this.get(id);
		if (response.status === 404) {
			throw new Error("no-Spo2_patient-found");
		}
		return response.body;
	}
}
