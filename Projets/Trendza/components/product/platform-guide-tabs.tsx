"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPlatformGuide, type GuideStep } from "@/lib/launch-kit";

function GuideSteps({ steps }: { steps: GuideStep[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <li
          key={step.titre}
          className="flex gap-4 rounded-xl border border-border bg-surface/40 p-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-end text-xs font-semibold text-white">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-medium">{step.titre}</p>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function PlatformGuideTabs({
  defaultPlatform = "woocommerce",
}: {
  defaultPlatform?: "woocommerce" | "mychariow";
}) {
  return (
    <Tabs defaultValue={defaultPlatform}>
      <TabsList>
        <TabsTrigger value="woocommerce">WordPress / WooCommerce</TabsTrigger>
        <TabsTrigger value="mychariow">MyChariow</TabsTrigger>
      </TabsList>
      <TabsContent value="woocommerce">
        <GuideSteps steps={getPlatformGuide("woocommerce")} />
      </TabsContent>
      <TabsContent value="mychariow">
        <GuideSteps steps={getPlatformGuide("mychariow")} />
      </TabsContent>
    </Tabs>
  );
}
