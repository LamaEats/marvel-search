
import { Order,  } from "../types";
import { OrderRegistrationRequestData, Recipient,  } from "./types";

export const orderRegistrationRequestDataAdapter = (
    recipient: Recipient,
    order: Order,
    clientOrderNumber: string,
): OrderRegistrationRequestData => {
    const { name, phone, email } = recipient;
    const [firstName, ...lastName] = name.split(' ');
    const {
        address: { city, street, house, flat },
    } = recipient;

    return {
        order: {
            recipient: {
                name: firstName,
                // eslint-disable-next-line @typescript-eslint/camelcase
                last_name: lastName.join(),
                email,
                phone,
            },
            payment: {
                type: 'PREPAY',
            },
            location: {
                country: 'RU',
                city,
            },
            address: {
                street,
                house,
                apartment: flat || 'Частный дом', // Если нет квартиры хардкодим частный дом (требование API)
            },
            goods: order.items.map(({ id, price, quantity }) => ({
                code: String(id),
                price: price * 100,
                quantity,
            })),
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        order_number_client: clientOrderNumber,
    };
};