"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import type React from "react";

interface ModalProps {
	isModalOpen: boolean;
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// A simple modal component which can be shown/hidden with a boolean and a function
// Because of the setIsModalOpen function, you can't use it in a server component.
const Modal = ({ isModalOpen, setIsModalOpen }: ModalProps) => {
	return (
		<Transition appear show={isModalOpen} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-50"
				onClose={() => setIsModalOpen(false)}
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-neutral-focus bg-opacity-50" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-start justify-center overflow-hidden p-2 md:items-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="relative h-full w-full max-w-3xl transform overflow-visible rounded-xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all md:p-8">
								<div className="mb-4 flex items-center justify-between">
									<Dialog.Title as="h2" className="font-semibold">
										I&apos;m a modal
									</Dialog.Title>
									{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
									<button
										className="btn btn-square btn-ghost btn-sm"
										onClick={() => setIsModalOpen(false)}
									>
										{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="h-5 w-5"
										>
											<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
										</svg>
									</button>
								</div>

								<section>And here is my content</section>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default Modal;
