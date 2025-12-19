import { Order, OrderItem } from "@/lib/interfaces";
import Link from "next/link";

function getStatusClass(status: string) {
    const normalized = status.toLowerCase().replace(/ /g, "_");
    switch (normalized) {
        case "pending":
            return "bg-yellow-100 text-yellow-800";
        case "scheduled":
            return "bg-blue-100 text-blue-800";
        case "in_production":
            return "bg-orange-100 text-orange-800";
        case "quality_check":
            return "bg-purple-100 text-purple-800";
        case "in_repair":
            return "bg-pink-100 text-pink-800";
        case "ready":
        case "ready_for_shipment":
            return "bg-green-100 text-green-800";
        case "shipped":
            return "bg-cyan-100 text-cyan-800";
        case "completed":
            return "bg-gray-200 text-gray-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export default async function Page(props: PageProps<'/[locale]/order/[order_id]'>) {
    const { order_id } = await props.params;
    const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/operating/api/get_order_status/${order_id}`);
    const nejum_response = await fetch(nejum_api_link)
    let order: Order = {} as Order;
    if (nejum_response.ok) {
        order = await nejum_response.json() as Order;
        console.log(`your response is: ${JSON.stringify(order)}`);
    } else {
        console.error("failed to fetch order status")
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">Order Details</h1>
            <p className="text-gray-600 mb-4">Order ID: <span className="font-mono">{String(order_id)}</span></p>
            <p className="mb-6">
                <span className="font-semibold">Status:</span>{" "}
                {/* <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {order.status}
                </span> */}
                <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusClass(order.status)}`}>
                    {order.status
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
            </p>
            {order.items && order.items.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-gray-100 text-sm font-semibold text-gray-700 text-center">
                                <th className="px-4 py-2 border-b">Product</th>
                                <th className="px-4 py-2 border-b">Quantity</th>
                                <th className="px-4 py-2 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: OrderItem) => (
                                <tr key={item.id} className="even:bg-gray-50 text-sm text-center">
                                    <td className="px-4 py-2 border-b">
                                        <div className="flex flex-col items-start gap-1">
                                            <Link href={`/product/${item.product_category}/${item.product_sku}`} className="block bg-teal-50 hover:bg-teal-100 text-blue-900 font-semibold rounded px-3 py-2 transition-colors duration-150 no-underline">
                                                {item.product_title}
                                            </Link>
                                            {item.is_custom_curtain && (
                                                <div className="flex flex-col items-start gap-1 mt-1">
                                                    <span className="inline-block px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
                                                        ✂️ ÖZEL PERDE
                                                    </span>
                                                    {item.custom_attributes && (
                                                        <div className="text-xs text-gray-600 text-left mt-1 bg-purple-50 p-2 rounded">
                                                            {item.custom_attributes.width && item.custom_attributes.height && (
                                                                <p className="mb-0.5">📏 Boyut: {item.custom_attributes.width}cm x {item.custom_attributes.height}cm</p>
                                                            )}
                                                            {item.custom_attributes.pleat_type && (
                                                                <p className="mb-0.5">🧵 Pile: {item.custom_attributes.pleat_type}</p>
                                                            )}
                                                            {item.custom_attributes.pleat_density && (
                                                                <p className="mb-0.5">📊 Pile Sıklığı: {item.custom_attributes.pleat_density}</p>
                                                            )}
                                                            {item.custom_attributes.mounting_type && (
                                                                <p className="mb-0.5">🔧 Montaj: {item.custom_attributes.mounting_type === 'cornice' ? 'Korniş' : 'Rustik'}</p>
                                                            )}
                                                            {item.custom_attributes.wing_type && (
                                                                <p>🪟 Kanat: {item.custom_attributes.wing_type === 'single' ? 'Tek' : 'Çift'}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {item.custom_fabric_used_meters && (
                                                        <p className="text-xs text-purple-700 font-medium">🧶 Kumaş: {item.custom_fabric_used_meters} metre</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-4 py-2 border-b">{Number(item.quantity)} {item.unit_of_measurement}</td>
                                    <td className={`px-4 py-2 border-b`}>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusClass(item.status)}`}>
                                            {item.status
                                                .replace(/_/g, " ")
                                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <>
                    <table>...</table>
                    <p className="text-sm text-gray-500 italic">No items found for this order.</p>
                </>
            )}
        </div>
    );
}
