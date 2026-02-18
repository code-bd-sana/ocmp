// Import the model
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import PaymentModel, { IPayment } from './payment.model';
import { CreatePaymentInput } from './payment.validation';

/**
 * Service function to create a new payment.
 *
 * @param {CreatePaymentInput} data - The data to create a new payment.
 * @returns {Promise<Partial<IPayment>>} - The created payment.
 */
const createPayment = async (data: CreatePaymentInput): Promise<Partial<IPayment>> => {
  const newPayment = new PaymentModel(data);
  const savedPayment = await newPayment.save();
  return savedPayment;
};

/**
 * Service function to retrieve a single payment by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the payment to retrieve.
 * @returns {Promise<Partial<IPayment>>} - The retrieved payment.
 */
const getPaymentById = async (id: IdOrIdsInput['id']): Promise<Partial<IPayment | null>> => {
  const payment = await PaymentModel.findById(id);
  return payment;
};

/**
 * Service function to retrieve multiple payment based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering payment.
 * @returns {Promise<Partial<IPayment>[]>} - The retrieved payment
 */
const getManyPayment = async (
  query: SearchQueryInput
): Promise<{ payments: Partial<IPayment>[]; totalData: number; totalPages: number }> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      // { fieldName: { $regex: searchKey, $options: 'i' } },
      // Add more fields as needed
    ],
  };
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching payment
  const totalData = await PaymentModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find payments based on the search filter with pagination
  const payments = await PaymentModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { payments, totalData, totalPages };
};

export const paymentServices = {
  createPayment,
  getPaymentById,
  getManyPayment,
};
